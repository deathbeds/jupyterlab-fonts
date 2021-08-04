"""project automation for jupyterlab-fonts"""
from pathlib import Path


def task_binder():
    yield dict(name="all", actions=[["echo", "ok"]])


def task_lint():
    yield dict(name="black", actions=[["black", *P.ALL_PY]], file_dep=[*P.ALL_PY])

    yield dict(
        name="flake8",
        actions=[["flake8", *P.ALL_PY]],
        task_dep=["lint:black"],
        file_dep=[*P.ALL_PY],
    )


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


DOIT_CONFIG = {
    "backend": "sqlite3",
    "verbosity": 2,
    "par_type": "thread",
    "default_tasks": ["binder"],
}
