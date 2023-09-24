"""Cargo-culted actions for use with ``doitoml``."""

import json
import os
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


def clean_some(*paths) -> bool:
    """Clean up some paths."""
    for path in [Path(p) for p in paths]:
        if path.is_dir():
            shutil.rmtree(path)
        elif path.exists():
            path.unlink()
    return True


def run(*args, ok_rc=None):
    """Run something, maybe allowing non-zero return codes."""
    rc = subprocess.call(list(args), shell=False)
    return str(rc) in ok_rc or ["0"]


def maybe_atest_one(
    conda_run,
    attempt,
    last_attempt,
    out_dir,
    prev_out,
    atest_dir,
    jscov,
    atest_args=None,
):
    """Maybe run the robot test suite, if the previous attempt failed."""
    is_ok = "0"
    rc_name = "robot.rc"
    rc_path = Path(out_dir[0]) / rc_name

    dry_run = not attempt

    if attempt >= 2 and prev_out and prev_out[0]:
        prev_rc_path = Path(prev_out[0]) / rc_name
        prev_rc = prev_rc_path.read_text(**UTF8).strip()
        if prev_rc == is_ok:
            rc_path.parent.mkdir(parents=True, exist_ok=True)
            rc_path.write_text(is_ok, **UTF8)
            print(f"   ... skipping attempt {attempt} because previous attempt passed")
            return True
        print(f"   .... previous rc {prev_rc}")

    args = [*conda_run]

    if dry_run:
        args += [
            "robot",
            "--dry-run",
        ]
    else:
        args += [
            # pabot
            "pabot",
            "--processes",
            os.environ["ATEST_PROCESSES"],
            "--artifactsinsubfolders",
            "--artifacts",
            "png,log,txt,svg,ipynb,json",
        ]

    args += [
        # robot
        f"--variable=ATTEMPT:{ attempt }",
        f"""--variable=OS:{ os.environ["THIS_SUBDIR"] }""",
        f"""--variable=PY:{ os.environ.get("JLF_PY", os.environ.get("THIS_PY")) }""",
        f"""--variable=LAB:{ os.environ["JLF_LAB"] }""",
        f"--variable=JSCOV:{jscov[0]}",
        "--variable=ROOT:../../..",
        "--outputdir",
        out_dir[0],
        *(atest_args or []),
    ]

    if attempt >= 2:
        args += [
            "--loglevel",
            "TRACE",
            "--rerunfailed",
            f"{prev_out[0]}/output.xml",
        ]
    args += atest_dir

    print(">>>", "  ".join(args))
    rc = subprocess.call(args)
    print(f"   ... returned {rc}")

    rc_path.write_text(f"{rc}", **UTF8)

    if rc:
        if dry_run or attempt == last_attempt:
            print(f"   !!! FAILED after {last_attempt} attempts")
            return False
        print(
            f"   !!! FAILED attempt {attempt}: {rc}, "
            f"run dt:atest:a_{last_attempt} (or dt:atest:a_*) for a real error code",
        )

    return True


def copy_labextensions(prefix: str, *pkg_jsons: str) -> None:
    """Deploy already-built labextensions."""
    labextensions_root = Path(prefix) / "share/jupyter/labextensions"
    for pkg in pkg_jsons:
        pkg_path = Path(pkg)
        pkg_dir = pkg_path.parent
        print("... labextension:", pkg_dir)
        pkg_data = json.loads(pkg_path.read_text(**UTF8))
        pkg_name = f"""{pkg_data["name"]}"""
        dest = labextensions_root / pkg_name
        if dest.exists():
            shutil.rmtree(dest)
        if not dest.parent.exists():
            dest.parent.mkdir(parents=True)
        shutil.copytree(pkg_dir, dest)
        print("    ... copied to:", dest)


def touch(*paths: str) -> None:
    """Ensure some paths exist (including parent folders)."""
    for path in map(Path, paths):
        if not path.parent.exists():
            path.parent.mkdir(parents=True)
        path.touch()


def rebot(log_html, conda_run):
    """Merge robot reports.

    In the future:
    - fix relative paths
    - maybe run libdoc
    """
    cwd = Path(log_html[0]).parent
    log_root = cwd.parent
    if not log_root.is_dir():
        print(f"Can't even look for `output.xml` in missing {log_root}")
        return False
    shutil.rmtree(cwd, ignore_errors=True)
    cwd.mkdir()
    all_output = sorted(
        p
        for p in log_root.glob("*/output.xml")
        if not p.parent.name.endswith("a_0") or p.parent.name == "ALL"
    )
    if not all_output:
        print(f"No robot non dry-run `output.xml` files found in {log_root}")
        return False
    subprocess.call(
        [
            *conda_run,
            "rebot",
            "--processemptysuite",
            "--nostatusrc",
            *all_output,
        ],
        cwd=str(cwd),
    )
    return True
