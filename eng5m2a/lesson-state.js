// Seen markers use a separate key, scoped to a pupil and a dated release.
const LESSON_SEEN_KEY = KEY + '-lesson-seen';
let lessonSeen = {};
try {
  const cached = JSON.parse(localStorage.getItem(LESSON_SEEN_KEY) || '{}');
  if (cached && typeof cached === 'object' && !Array.isArray(cached)) lessonSeen = cached;
} catch {}
let syncingLessons = false;
let resyncAfterOpen = false;
const chapterRelease = {
  '2a': '2a', '2b': '2b', '2b-12nov': '2026-11-12',
  '2c-17nov': '2026-11-17', '2d-19nov': '2026-11-19'
};

function hasSeenLesson(release) {
  return !!(save.pupil && lessonSeen[save.pupil.id]?.[release]);
}

function newLessonBadge(release) {
  return `<span class="new-badge" data-release="${release}"${hasSeenLesson(release) ? ' hidden' : ''}>New</span>`;
}

function saveSeenLesson(release) {
  if (!save.pupil) return;
  lessonSeen[save.pupil.id] = {...lessonSeen[save.pupil.id], [release]: true};
  try { localStorage.setItem(LESSON_SEEN_KEY, JSON.stringify(lessonSeen)); } catch {}
  updateLessonBadges();
}

function updateLessonBadges() {
  app.querySelectorAll('.new-badge').forEach(badge => {
    badge.hidden = hasSeenLesson(badge.dataset.release);
  });
}

async function syncLessonState() {
  const session = save.lessonSession;
  if (TEST || syncingLessons || !save.pupil || !session || session.id !== save.pupil.id || !navigator.onLine) return;
  syncingLessons = true;
  const pupilId = save.pupil.id;
  const currentPupil = () => save.pupil?.id === pupilId && save.lessonSession === session;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const options = {headers: {authorization: 'Bearer ' + session.token}, signal: controller.signal};
    const url = API + '/lesson-state?game=' + GAME;
    const response = await fetch(url, options);
    if (!currentPupil()) return;
    if (response.status === 401) {
      save.lessonSession = null;
      store();
      return;
    }
    if (!response.ok) return;
    const data = await response.json();
    if (!currentPupil()) return;
    const seen = new Set(data.seen || []);
    for (const release of Object.values(chapterRelease)) {
      if (!currentPupil()) return;
      if (seen.has(release)) {
        if (!hasSeenLesson(release)) saveSeenLesson(release);
      } else if (hasSeenLesson(release)) {
        await fetch(url, {...options, method: 'POST',
          headers: {...options.headers, 'content-type': 'application/json'},
          body: JSON.stringify({release})});
      }
    }
  } catch {
    // Keep the local marker. Online and focus events retry the same idempotent write.
  } finally {
    clearTimeout(timeout);
    syncingLessons = false;
    if (resyncAfterOpen || save.pupil?.id !== pupilId) {
      resyncAfterOpen = false;
      syncLessonState();
    }
  }
}

function openLessonChapter(chapter = LESSON_RELEASE.chapter) {
  const open = () => {
    CH = chapter;
    if (chapterRelease[chapter]) saveSeenLesson(chapterRelease[chapter]);
    if (syncingLessons) resyncAfterOpen = true;
    home();
    syncLessonState();
  };
  if (!save.pupil || (!TEST && navigator.onLine && save.lessonSession?.id !== save.pupil.id)) return askName(open);
  open();
}

addEventListener('online', syncLessonState);
addEventListener('focus', syncLessonState);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) syncLessonState();
});
