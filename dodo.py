"""project automation for jupyterlab-fonts"""
from pathlib import Path


def task_setup():
    """perform early setup"""
    yield dict(
        name="js",
        actions=[[*C.JLPM, "--prefer-offline", "--ignore-optional"]],
        targets=[P.YARN_INTEGRITY],
        file_dep=[P.YARN_LOCK, *P.ALL_PACKAGE_JSONS],
    )


def task_build():
    yield dict(
        name="js:pre",
        actions=[[*C.LERNA, "run", "prebuild"]],
        file_dep=[P.YARN_INTEGRITY],
    )
    yield dict(
        name="js:tsc",
        actions=[[*C.LERNA, "run", "build"]],
        file_dep=[P.YARN_INTEGRITY, *P.ALL_TS],
        task_dep=["build:js:pre"],
    )


def task_binder():
    """get ready for interactive development"""
    yield dict(name="all", actions=[["echo", "ok"]])


def task_lint():
    """apply source formatting, check for mistakes"""
    yield dict(name="black", actions=[["black", *P.ALL_PY]], file_dep=[*P.ALL_PY])

    yield dict(
        name="flake8",
        actions=[["flake8", *P.ALL_PY]],
        task_dep=["lint:black"],
        file_dep=[*P.ALL_PY],
    )

    yield dict(
        name="prettier",
        actions=[
            [
                *C.JLPM,
                "prettier",
                "--write",
                "--list-different",
                *[p.relative_to(P.ROOT) for p in P.ALL_PRETTIER],
            ]
        ],
        file_dep=[*P.ALL_PRETTIER, P.YARN_INTEGRITY],
    )

    yield dict(
        name="eslint",
        actions=[
            [
                *C.JLPM,
                "eslint",
                "--cache",
                "--config",
                P.ESLINTRC,
                "--ext",
                ".js,.jsx,.ts,.tsx",
                "--fix",
                "packages",
            ]
        ],
        task_dep=["lint:prettier"],
        file_dep=[*P.ALL_ESLINT, P.ESLINTRC],
    )


class C:
    """constants"""

    JLPM = ["jlpm"]
    LERNA = [*JLPM, "lerna"]
    PY = ["python"]
    PYM = [*PY, "-m"]
    PIP = [*PYM, "pip"]


class P:
    """paths"""

    DODO = Path(__file__)
    ROOT = DODO.parent
    ALL_PY = [*ROOT.glob("*.py")]
    PACKAGES = ROOT / "packages"
    PACKAGE_JSONS = [*PACKAGES.glob("*/package.json")]
    ROOT_PACKAGE_JSON = ROOT / "package.json"
    ALL_PACKAGE_JSONS = [ROOT_PACKAGE_JSON, *PACKAGE_JSONS]
    NODE_MODULES = ROOT / "node_modules"
    YARN_INTEGRITY = NODE_MODULES / ".yarn-integrity"
    YARN_LOCK = ROOT / "yarn.lock"
    ESLINTRC = ROOT / ".eslintrc.js"
    ALL_SCHEMA = [*PACKAGES.glob("*/schema/*.json")]
    ALL_TS = [*PACKAGES.glob("*/src/**/*.ts"), *PACKAGES.glob("*/src/**/*.tsx")]
    ALL_MD = [*ROOT.glob("*.md")]
    ALL_PRETTIER = [*ALL_PACKAGE_JSONS, *ALL_MD, *ALL_TS, *ALL_SCHEMA]
    ALL_ESLINT = [*ALL_TS]


DOIT_CONFIG = {
    "backend": "sqlite3",
    "verbosity": 2,
    "par_type": "thread",
    "default_tasks": ["binder"],
}
