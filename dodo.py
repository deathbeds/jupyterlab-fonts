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

    # TODO
    # yield dict(
    #     name="eslint"
    # )


class C:
    """constants"""

    JLPM = ["jlpm"]
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
    ALL_MD = [*ROOT.glob("*.md")]
    ALL_PRETTIER = [*ALL_PACKAGE_JSONS, *ALL_MD]


DOIT_CONFIG = {
    "backend": "sqlite3",
    "verbosity": 2,
    "par_type": "thread",
    "default_tasks": ["binder"],
}
