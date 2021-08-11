"""project automation for jupyterlab-fonts"""
from pathlib import Path
import json


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
        targets=[*B.ALL_CORE_SCHEMA],
    )

    yield dict(
        name="js:tsc",
        actions=[[*C.LERNA, "run", "build"]],
        file_dep=[P.YARN_INTEGRITY, *P.ALL_TS, *B.ALL_CORE_SCHEMA],
        targets=[B.META_BUILDINFO],
    )

    ext_pkg_jsons = []

    for pkg_json, pkg in D.PKG_JSON_DATA.items():
        if "jupyterlab" not in pkg:
            continue
        name = pkg["name"]
        pkg_dir = pkg_json.parent
        style = pkg_dir / "style"
        schema = pkg_dir / "schema"
        lib = pkg_dir / "lib"
        ext_pkg_json = B.LABEXT / name / "package.json"
        ext_pkg_jsons += [ext_pkg_json]
        yield dict(
            name=f"ext:{name}",
            file_dep=[
                B.META_BUILDINFO,
                pkg_json,
                *style.rglob("*.*"),
                *lib.rglob("*.*"),
                *schema.glob("*.*"),
            ],
            actions=[
                [
                    *C.LERNA,
                    "exec",
                    "--scope",
                    name,
                    "jupyter",
                    "labextension",
                    "build",
                    ".",
                ]
            ],
            targets=[ext_pkg_json],
        )

    yield dict(
        name="py",
        file_dep=[*ext_pkg_jsons, *P.ALL_PY_SRC],
        actions=[[*C.PY, "setup.py", "sdist", "bdist_wheel"]],
    )


def task_binder():
    """get ready for interactive development"""
    yield dict(name="all", task_dep=["build", "setup"], actions=[["echo", "ok"]])


def task_lab():
    yield dict(
        name="launch",
        task_dep=["binder"],
        actions=[["jupyter", "lab", "--no-browser", "--debug"]],
    )


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
    SCHEMA_DTS = "_schema.d.ts"
    TSBUILDINFO = "tsconfig.tsbuildinfo"
    ENC = dict(encoding="utf-8")


class P:
    """paths"""

    DODO = Path(__file__)
    ROOT = DODO.parent
    PACKAGES = ROOT / "packages"
    CORE = PACKAGES / "jupyterlab-fonts"
    CORE_SRC = CORE / "src"
    CORE_LIB = CORE / "lib"
    META = PACKAGES / "_meta"

    PY_SRC = ROOT / "src/jupyterlab_fonts"
    ALL_PY_SRC = PY_SRC.rglob("*.py")

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
    ALL_PY = [*ROOT.glob("*.py"), *ALL_PY_SRC]


class D:
    PKG_JSON_DATA = {
        pkg_json: json.loads(pkg_json.read_text(**C.ENC))
        for pkg_json in P.PACKAGE_JSONS
    }


class B:
    """built things"""

    CORE_SCHEMA_SRC = P.CORE_SRC / C.SCHEMA_DTS
    CORE_SCHEMA_LIB = P.CORE_LIB / C.SCHEMA_DTS
    ALL_CORE_SCHEMA = [CORE_SCHEMA_SRC, CORE_SCHEMA_LIB]
    META_BUILDINFO = P.META / C.TSBUILDINFO
    LABEXT = P.PY_SRC / "labextensions"


DOIT_CONFIG = {
    "backend": "sqlite3",
    "verbosity": 2,
    "par_type": "thread",
    "default_tasks": ["binder"],
}
