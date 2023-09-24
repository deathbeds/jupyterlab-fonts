"""Actions for working with conda-lock."""
import shutil
import subprocess
import tempfile
import textwrap
from functools import lru_cache
from itertools import product
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml

UTF8 = {"encoding": "utf-8"}
JSON_FMT = {"indent": 2, "sort_keys": True}
EXPLICIT = "@EXPLICIT"


@lru_cache(1000)
def safe_load(path: Path) -> Dict[str, Any]:
    """Load and cache some YAML."""
    return yaml.safe_load(path.read_bytes())


def iter_spec_stacks(spec_path, platform):
    """Generate ``environment.yml``."""
    spec = safe_load(spec_path)
    # initialize the stacks
    base_stack = [spec_path]
    stacks = [base_stack]

    platforms = spec.get("platforms")

    if platforms and platform not in platforms:
        return

    for inherit in spec.get("_inherit_from", []):
        substacks = [*iter_spec_stacks(spec_path.parent / inherit, platform)]
        if substacks:
            stacks = [[*stack, *substack] for substack in substacks for stack in stacks]

    factors = [
        sorted((spec_path.parent / factor).glob("*.yml"))
        for factor in spec.get("_matrix", [])
    ]

    if factors:
        matrix_stacks = []
        for row in product(*factors):
            matrix_stacks += [
                sum(
                    [
                        substack
                        for factor in row
                        for substack in iter_spec_stacks(factor, platform)
                    ],
                    [],
                ),
            ]
        stacks = [
            [*stack, *matrix_stack]
            for matrix_stack in matrix_stacks
            for stack in stacks
        ]

    yield from stacks


class IndentDumper(yaml.SafeDumper):

    """Safe dump with indenting."""

    def increase_indent(self, flow=None, indentless=None):
        """Add more indentation."""
        flow = True if flow is None else flow
        indentless = False
        return super().increase_indent(flow=flow, indentless=indentless)


def merge_envs(env_path: Optional[Path], stack: List[Path]) -> Optional[str]:
    """Create a normalized set of dependencies from a stack of files."""
    env = {"channels": [], "dependencies": []}

    for stack_yml in stack:
        stack_data = safe_load(stack_yml)
        env["channels"] = stack_data.get("channels") or env["channels"]
        if "dependencies" not in stack_data:
            msg = f"{stack_yml.name} needs 'dependencies'"
            raise ValueError(msg)
        env["dependencies"] += stack_data["dependencies"]

    env["dependencies"] = sorted(set(env["dependencies"]))

    env_str = yaml.dump(env, Dumper=IndentDumper)

    if env_path:
        env_path.write_text(env_str, **UTF8)
        return None

    return env_str


def lock_comment(stack: List[Path], indent="# ") -> str:
    """Generate a lockfile header comment."""
    return textwrap.indent(merge_envs(None, stack), indent)


def needs_lock(lockfile: Path, stack: List[Path]) -> bool:
    """Determine whether the lockfile is up-to-date."""
    if not lockfile.exists():
        return True
    lock_text = lockfile.read_text(**UTF8)
    comment = lock_comment(stack)
    return comment not in lock_text


def lock_one(platform: str, lockfile: Path, stack: List[Path]) -> bool:
    """Lock one path, based on its input env stack."""
    if not needs_lock(lockfile, stack):
        print(f"    --- lockfile up-to-date: {lockfile}")
        return True

    print(f"    ... updating: {lockfile}")

    if not lockfile.parent.exists():
        print(f"    ... creating {lockfile.parent}")
        lockfile.parent.mkdir(parents=True)

    comment = lock_comment(stack)

    for solver in [["--mamba"], ["--no-mamba"]]:
        lock_args = ["conda-lock", *solver, "--kind=explicit"]
        for env_file in stack:
            lock_args += ["--file", env_file]
        lock_args += [f"--platform={platform}"]

        rc = 1

        with tempfile.TemporaryDirectory() as td:
            tdp = Path(td)
            tmp_lock = tdp / f"conda-{platform}.lock"
            str_args = list(map(str, lock_args))
            print(f"""    >>> {" ".join(str_args)}""")
            rc = subprocess.call(str_args, cwd=td)
            print(f"    ... STATUS {rc}")
            if rc != 0:
                continue
            raw = tmp_lock.read_text(**UTF8).split(EXPLICIT)[1].strip()
            lockfile.write_text("\n".join([comment, EXPLICIT, raw, ""]), **UTF8)
            print(f"    ... OK {lockfile}")
            return True

        print(f"    !!! FAIL {lockfile}")
        return False
    return None


def lock_stem(subdir, stack: List[Path]) -> str:
    """Calculate the lockfile/env name stem."""
    first = stack[0]
    return "_".join(
        [first.stem, subdir] + [s.stem for s in stack if s.parent != first.parent],
    )


def preflight(
    preflight_yml: str,
    *lock_specs_yml: str,
    subdirs: List[str],
) -> Optional[bool]:
    """Generate a preflight yaml and all of the headers."""
    preflight = Path(preflight_yml)
    lock_build = preflight.parent
    if lock_build.exists():
        shutil.rmtree(preflight.parent)
    preflight.parent.mkdir(parents=True)
    specs = [Path(p) for p in lock_specs_yml]
    all_info = {}
    for spec_path in specs:
        for subdir in subdirs:
            for stack in iter_spec_stacks(spec_path, subdir):
                first = safe_load(stack[0])
                target = first.get("_target")
                if target:
                    Path(target).write_text(lock_comment(stack, ""), **UTF8)
                stem = lock_stem(subdir, stack)
                txt = lock_build / f"{stem}.txt"
                txt.write_text(lock_comment(stack), **UTF8)
                all_info[stem] = {
                    "subdir": subdir,
                    "stack": [str(p) for p in stack],
                }
    preflight.write_text(yaml.safe_dump(dict(sorted(all_info.items()))))


def lock_from_preflight(lock_dir: str, header_path: str, preflight_path: str) -> None:
    """Generate a single lockfile from the preflight file."""
    preflight = safe_load(Path(preflight_path))
    header = Path(header_path)
    header_txt = header.read_text(**UTF8)
    info = preflight[header.stem]
    lockfile = Path(lock_dir) / f"{header.stem}.conda.lock"
    if lockfile.exists() and header_txt in lockfile.read_text(**UTF8):
        print(f"    --- up-to-date: {lockfile}")
        return True
    print("    ... solving:")
    print(textwrap.indent(yaml.safe_dump(info), "    "))
    return lock_one(info["subdir"], lockfile, [Path(p) for p in info["stack"]])
