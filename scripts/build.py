""" build lab, clean, and rebuild without duplicated extensions
"""
import sys
from . import APP_DIR
from .dedupe import dedupe

import subprocess


def build():
    subprocess.check_call(["jupyter", "lab", "build", "--minimize=False"])
    dedupe()
    return subprocess.call(["jlpm", "build", "--dev-mode=False", "--minimize=True", "--debug"], cwd=APP_DIR / "staging")


if __name__ == "__main__":
    sys.exit(build())
