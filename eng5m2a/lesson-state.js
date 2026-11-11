// Seen markers use a separate key, scoped to a pupil and a dated release.
const LESSON_SEEN_KEY = KEY + '-lesson-seen';
let lessonSeen = {};
try {
  const cached = JSON.parse(localStorage.getItem(LESSON_SEEN_KEY) || '{}');
  if (cached && typeof cached === 'object' && !Array.isArray(cached)) lessonSeen = cached;
} catch {}
let syncingLessons = false;

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
    if (data.seen?.includes(LESSON_RELEASE.id)) saveSeenLesson(LESSON_RELEASE.id);
    // A marker made offline stays pending until the server confirms it.
    if (hasSeenLesson(LESSON_RELEASE.id) && !data.seen?.includes(LESSON_RELEASE.id)) {
      await fetch(url, {...options, method: 'POST',
        headers: {...options.headers, 'content-type': 'application/json'},
        body: JSON.stringify({release: LESSON_RELEASE.id})});
    }
  } catch {
    // Keep the local marker. Online and focus events retry the same idempotent write.
  } finally {
    clearTimeout(timeout);
    syncingLessons = false;
    if (save.pupil?.id !== pupilId) syncLessonState();
  }
}

function openLessonChapter() {
  const open = () => {
    CH = LESSON_RELEASE.chapter;
    saveSeenLesson(LESSON_RELEASE.id);
    home();
    syncLessonState();
  };
  // Existing pupil saves can still use old chapters. The new sync needs a code-authenticated session.
  if (!save.pupil || (!TEST && save.lessonSession?.id !== save.pupil.id)) return askName(open);
  open();
}

addEventListener('online', syncLessonState);
addEventListener('focus', syncLessonState);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) syncLessonState();
});
