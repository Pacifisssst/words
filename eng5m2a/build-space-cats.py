"""Prepare the approved classroom assets for the local Meow English preview."""

import json
import shutil
import subprocess
import sys
from pathlib import Path

lesson = Path(sys.argv[1])
trainer = Path(__file__).resolve().parent
assets = trainer / "space-cats"
practice = trainer / "img" / "lesson-2b"
assets.mkdir(exist_ok=True)
practice.mkdir(exist_ok=True)

source = json.loads((lesson / "song-cues.json").read_text())
# Match the approved classroom karaoke where Whisper split a displayed name.
splits = {49.48: (4, 1), 53.66: (4, 2), 61.44: (5, 1), 114.44: (3, 1)}


def image_path(path):
    return f"space-cats/{Path(path).stem}.webp"


def convert(src, dest):
    subprocess.run(
        ["cwebp", "-quiet", "-q", "80", "-resize", "800", "0", str(src), "-o", str(dest)],
        check=True,
    )


lines = []
for cue in source["cues"]:
    split_at, extra = splits.get(cue["start"], (float("inf"), 0))
    words = []
    for index, word in enumerate(cue["en"].split()):
        token_index = index + (extra if index > split_at else 0)
        tokens = cue["words"]
        start = tokens[token_index]["start"] if token_index < len(tokens) else cue["start"]
        words.append([word, start])
    lines.append({
        "start": cue["start"], "end": cue["end"], "image": image_path(cue["image"]),
        "ru": cue["ru"], "words": words,
    })

for path in {source["intro_image"], *(cue["image"] for cue in source["cues"])}:
    convert(lesson / path, trainer / image_path(path))

for name in ("duck-near-one", "duck-near-two", "duck-far-one", "duck-far-two",
             "near-helmet", "far-cameras"):
    convert(lesson / "img" / "new" / f"{name}.jpg", practice / f"{name}.webp")

shutil.copyfile(lesson / source["audio"], assets / "space-cats.mp3")
(assets / "cues.json").write_text(json.dumps({
    "intro": image_path(source["intro_image"]), "lines": lines,
}, ensure_ascii=False) + "\n")
