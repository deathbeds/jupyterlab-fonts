""" build lab, clean, and rebuild without duplicated extensions
"""
import sys
from . import APP_DIR
from .dedupe import dedupe

import subprocess


def build():
    subprocess.check_call(["jupyter", "lab", "build", "--minimize=False", "--debug"])
    dedupe()
    return subprocess.call(["jlpm", "build"], cwd=APP_DIR / "staging")


if __name__ == "__main__":
    sys.exit(build())
