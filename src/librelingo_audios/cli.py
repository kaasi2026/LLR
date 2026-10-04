#!/usr/bin/env python3
import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    import yaml
    from librelingo_audios.tts import get_tts
    from librelingo_yaml_loader import load_course
    from librelingo_utils import (
        audio_id,
        iterate_phrases,
        iterate_words,
        remove_control_characters_for_display,
    )
except ModuleNotFoundError as error:
    raise SystemExit(
        f"Missing Python dependency '{error.name}'. From the repository root, install the local project with "
        "`python -m pip install -e ./src` in Python 3.10-3.14."
    ) from error


def load_config():
    # Try relative to package first
    candidate = Path(__file__).parent / "config.yaml"
    if candidate.exists():
        with open(candidate, "r") as file:
            return yaml.safe_load(file)

    # Fallback to old path
    with open("librelingo_audios/config.yaml", "r") as file:
        return yaml.safe_load(file)


def generate_course_audio(course_path, output_dir, course_name):
    # Load config
    config = load_config()

    course = load_course(course_path)

    # Check, if audio has been activated
    if not course.settings.audio_settings.enabled:
        print("Audio generation is disabled in course.yaml")
        return

    # Merge TTS config: global config <- course settings (if present)
    tts_config = {**config.get("tts", {})}
    tts_settings = course.settings.audio_settings.text_to_speech_settings_list
    if tts_settings:
        # tts_settings is a list of TextToSpeechSettings, pick first
        first = tts_settings[0]
        # convert namedtuple-like to dict-ish
        tts_config.update({
            "provider": first.provider,
            "voice": first.voice,
            "engine": getattr(first, "engine", None),
        })

    if "provider" not in tts_config:
        raise ValueError("No TTS provider configured")

    tts_config["provider"] = tts_config["provider"].lower()
    tts = get_tts(tts_config["provider"], tts_config)

    # If using gTTS, always use the course target language for audio.
    # This is necessary because different courses may use different languages
    # and the repository default config.yaml may contain a fixed language like 'de'.
    if tts_config.get("provider") == "gtts" and course is not None:
        tts_config["language"] = course.target_language.code
        tts = get_tts(tts_config["provider"], tts_config)

    # Create output folder
    os.makedirs(output_dir, exist_ok=True)

    # Collect unique texts from phrases and words
    texts = set()
    for phrase in iterate_phrases(course):
        texts.add(remove_control_characters_for_display(phrase.in_target_language[0]))
    for word in iterate_words(course):
        texts.add(remove_control_characters_for_display(word.in_target_language[0]))

    for text in sorted(texts):
        if not text:
            continue
        aid = audio_id(course.target_language, text)
        output_file = os.path.join(output_dir, f"{aid}.mp3")
        if os.path.exists(output_file):
            continue
        print(f"Generating audio for: {text}")
        tts.generate(text, output_file)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python cli.py <course_path> <output_dir> <course_name>")
        sys.exit(1)

    course_path = sys.argv[1]
    output_dir = sys.argv[2]
    course_name = sys.argv[3]

    generate_course_audio(course_path, output_dir, course_name)
