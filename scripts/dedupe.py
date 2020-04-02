from . import APP_DIR, NS, MAIN

from pathlib import Path
import shutil

NS_MODULES = APP_DIR / "staging" / "node_modules" / NS


def dedupe():
    for mod in NS_MODULES.glob(f"*"):
        nested = mod / "node_modules" / NS / MAIN
        print("maybe deleting", nested)
        nested.is_dir() and shutil.rmtree(nested)

if __name__ == "__main__":
    dedupe()
