""" watcher script which uses a pre-built lab's staging dir directly
"""
from . import APP_DIR
from .dedupe import dedupe

import subprocess


def watch():
    dedupe()
    subprocess.check_call(["jlpm", "build", "--watch"], cwd=APP_DIR / "staging")


if __name__ == "__main__":
    watch()
