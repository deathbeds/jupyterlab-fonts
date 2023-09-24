"""project automation for jupyterlab-fonts."""
import json
import os
import platform
import shutil
import sys
import warnings
from pathlib import Path

from doitoml import DoiTOML
from ruamel.yaml import safe_load

DOT_ENV = Path(".env")

dotenv_loaded = {}

if DOT_ENV.exists():
    try:
        import dotenv

        dotenv_loaded = dotenv.dotenv_values(DOT_ENV)
        dotenv.load_dotenv()
    except ImportError as err:
        warnings.warn(
            f"{DOT_ENV} found, but cannot load python-dotenv: {err}",
            stacklevel=1,
        )


class C:

    """Constants."""

    SUBDIRS = ["linux-64", "osx-64", "win-64"]
    THIS_SUBDIR = {"Linux": "linux-64", "Darwin": "osx-64", "Windows": "win-64"}[
        platform.system()
    ]
    THIS_PY = "{}.{}".format(*sys.version_info)
    PYTHONS = [
        "3.8",
        "3.11",
    ]
    PY_LABS = {
        "3.8": "lab3.5",
        "3.11": "lab4.0",
    }
    DEFAULT_PY = os.environ.get("JLF_PY", PYTHONS[-1])
    DEFAULT_LAB = PY_LABS[DEFAULT_PY]
    JLF_LAB = os.environ.get("JLF_LAB", DEFAULT_LAB)
    UTF8 = {"encoding": "utf-8"}
    JSON_FMT = {"indent": 2, "sort_keys": True}
    DEFAULT_SUBDIR = "linux-64"
    CI = bool(json.loads(os.environ.get("CI", "0")))
    RTD = os.environ.get("READTHEDOCS") == "True"
    DOCS_IN_CI = bool(json.loads(os.environ.get("DOCS_IN_CI", "0")))
    TEST_IN_CI = bool(json.loads(os.environ.get("TEST_IN_CI", "0")))
    DOCS_OR_TEST_IN_CI = DOCS_IN_CI or TEST_IN_CI
    DEMO_IN_BINDER = bool(json.loads(os.environ.get("DEMO_IN_BINDER", "0")))
    RUNNING_LOCALLY = not CI
    LAB_ARGS = safe_load(os.environ.get("LAB_ARGS", '["--no-browser", "--debug"]'))

    if CI:
        PY = Path(
            shutil.which("python3")
            or shutil.which("python")
            or shutil.which("python.exe"),
        ).resolve()
        CONDA_EXE = Path(
            shutil.which("conda")
            or shutil.which("conda.exe")
            or shutil.which("conda.cmd"),
        ).resolve()
    else:
        PY = "python.exe" if THIS_SUBDIR == "win-64" else "python"
        CONDA_EXE = "conda"
    PYM = [PY, "-m"]


class P:

    """Paths."""

    DODO = Path(__file__)
    ROOT = DODO.parent
    BUILD = ROOT / "build"
    ENVS = ROOT / ".envs"
    DEV_PREFIX = ENVS / "dev"

    SYS_PREFIX = sys.prefix if C.CI or C.DEMO_IN_BINDER else str(DEV_PREFIX)
    SAFE_PATHS = [
        ROOT.as_posix(),
        *([str(SYS_PREFIX)] if C.CI or C.DEMO_IN_BINDER else []),
    ]


env_patches = {
    "JLF_ROOT": P.ROOT,
    "CONDA_EXE": C.CONDA_EXE,
    "DEFAULT_LAB": C.DEFAULT_LAB,
    "JLF_LAB": C.JLF_LAB,
    "JLF_SYS_PREFIX": P.SYS_PREFIX,
    "THIS_PY": C.THIS_PY,
    "THIS_SUBDIR": C.THIS_SUBDIR,
}

if C.DEMO_IN_BINDER:
    env_patches["JLF_BUILD_PREFIX"] = P.SYS_PREFIX
    __import__("pprint").pprint(env_patches)

# handle dynamic sys.prefix
os.environ.update(
    {k: str(v) for k, v in env_patches.items()},
)

# configure doitoml, allowing changing `sys.prefix` in CI
doitoml = DoiTOML(
    config_paths=[P.ROOT / "pyproject.toml"],
    safe_paths=P.SAFE_PATHS,
)
dt_dict = doitoml.config.to_dict()
globals().update(doitoml.tasks())


def _ok(name):
    print(f"OK {name}")


def _phony(name, *extra):
    """Make a phony task."""

    def task():
        return {"actions": [(_ok, [name])], "task_dep": [f"*:{name}:*", *extra]}

    globals().update({f"task_{name}": task})


_phony("fix")
_phony("lint")
_phony("dist")
_phony("build", "*:build:*")
_phony("test", "*:atest:*")
_phony("lab", "dt:serve:lab")
_phony("report")

if dotenv_loaded:
    os.environ.update(dotenv_loaded)
