"""Cargo-culted actions for use with ``doitoml``."""

import json
import shutil
import subprocess
from hashlib import sha256
from pathlib import Path

UTF8 = {"encoding": "utf-8"}
JSON_FMT = {"indent": 2, "sort_keys": True}


# new actions that might move out
def splice_json(key: str, src: str, dest: str):
    """Copy a single key from one JSON file to another."""
    src_json = json.load(Path(src).open())
    dest_path = Path(dest)
    dest_json = json.load(dest_path.open())
    dest_json[key] = src_json[key]
    dest_path.write_text(json.dumps(dest_json, **JSON_FMT), **UTF8)


def source_date_epoch():
    """Fetch the git commit date for reproducible builds."""
    return (
        subprocess.check_output(["git", "log", "-1", "--format=%ct"])
        .decode("utf-8")
        .strip()
    )


def git_info():
    """Dump some git info."""
    print(json.dumps({"SOURCE_DATE_EPOCH": source_date_epoch()}))


def merge_json(src_path: str, dest_path: str):
    """Do a dumb merge of two JSON files."""
    src = Path(src_path)
    dest = Path(dest_path)

    if not dest.parent.exists():
        dest.parent.mkdir(parents=True)

    old_data = {} if not dest.exists() else json.load(dest.open())
    new_data = dict(**old_data)
    new_data.update(json.load(src.open()))

    new_data_text = json.dumps(new_data, **JSON_FMT)
    old_data_text = json.dumps(old_data, **JSON_FMT)

    if new_data_text != old_data_text:
        dest.write_text(new_data_text)


def hash_some(hash_file, *hash_inputs):
    """Write a hashfile of the given inputs."""
    hash_path = Path(hash_file)
    input_paths = [Path(hi) for hi in hash_inputs]
    if hash_path.exists():
        hash_path.unlink()

    lines = []

    for p in sorted(input_paths):
        lines += ["  ".join([sha256(p.read_bytes()).hexdigest(), p.name])]

    output = "\n".join(lines)
    print(output)
    hash_path.write_text(output, encoding="utf-8")


def clean_some(*paths):
    """Clean up some paths."""
    for path in [Path(p) for p in paths]:
        if path.is_dir():
            shutil.rmtree(path)
        elif path.exists():
            path.unlink()


def run(*args, ok_rc=None):
    """Run something, maybe allowing non-zero return codes."""
    rc = subprocess.call(list(args), shell=False)
    return str(rc) in ok_rc or ["0"]
