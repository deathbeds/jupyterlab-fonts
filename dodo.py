"""project automation for jupyterlab-fonts"""
import hashlib
import json
import os
import re
import sys
from pathlib import Path

import doit.action
import doit.tools


class C:
    """constants"""

    JLPM = ["jlpm"]
    LERNA = [*JLPM, "lerna"]
    PY = [sys.executable]
    PYM = [*PY, "-m"]
    PIP = [*PYM, "pip"]
    JPY = [*PYM, "jupyter"]
    SCHEMA_DTS = "_schema.d.ts"
    TSBUILDINFO = "tsconfig.tsbuildinfo"
    ENC = dict(encoding="utf-8")
    CORE_EXT = "@deathbeds/"
    CI = bool(json.loads(os.environ.get("CI", "0")))
    ATEST_ARGS = json.loads(os.environ.get("ATEST_ARGS", "[]"))


class P:
    """paths"""

    DODO = Path(__file__)
    ROOT = DODO.parent
    GH = ROOT / ".github"
    LICENSE = ROOT / "LICENSE"
    README = ROOT / "README.md"
    BINDER = ROOT / ".binder"
    DIST = ROOT / "dist"
    PACKAGES = ROOT / "packages"
    ATEST = ROOT / "atest"
    CORE = PACKAGES / "jupyterlab-fonts"
    CORE_PKG_JSON = CORE / "package.json"
    CORE_SRC = CORE / "src"
    CORE_LIB = CORE / "lib"

    META = PACKAGES / "_meta"
    META_PKG_JSON = META / "package.json"

    PY_SRC = ROOT / "src/jupyterlab_fonts"
    PY_SETUP = [ROOT / "setup.cfg", ROOT / "setup.py", ROOT / "MANIFEST.in"]
    ALL_PY_SRC = [*PY_SRC.rglob("*.py")]

    PACKAGE_JSONS = [*PACKAGES.glob("*/package.json")]
    ROOT_PACKAGE_JSON = ROOT / "package.json"
    ALL_PACKAGE_JSONS = [ROOT_PACKAGE_JSON, *PACKAGE_JSONS]
    NODE_MODULES = ROOT / "node_modules"
    YARN_INTEGRITY = NODE_MODULES / ".yarn-integrity"
    YARN_LOCK = ROOT / "yarn.lock"
    ESLINTRC = ROOT / ".eslintrc.js"

    ALL_ROBOT = [*ATEST.rglob("*.robot")]

    ALL_SCHEMA = [*PACKAGES.glob("*/schema/*.json")]
    ALL_YAML = [*BINDER.glob("*.yml"), *GH.rglob("*.yml")]
    ALL_TS = [*PACKAGES.glob("*/src/**/*.ts"), *PACKAGES.glob("*/src/**/*.tsx")]
    ALL_MD = [*ROOT.glob("*.md"), *PACKAGES.glob("*/*.md")]
    ALL_JSON = [*ALL_PACKAGE_JSONS, *BINDER.glob("*.json"), *ALL_SCHEMA]
    ALL_PRETTIER = [*ALL_JSON, *ALL_MD, *ALL_TS, *ALL_YAML]
    ALL_ESLINT = [*ALL_TS]
    ALL_PY = [*ROOT.glob("*.py"), *ALL_PY_SRC]


class D:
    PKG_JSON_DATA = {
        pkg_json: json.loads(pkg_json.read_text(**C.ENC))
        for pkg_json in P.PACKAGE_JSONS
    }
    CORE_PKG_DATA = PKG_JSON_DATA[P.CORE_PKG_JSON]
    CORE_PKG_VERSION = CORE_PKG_DATA["version"]


class U:
    @staticmethod
    def npm_tgz_name(pkg_json):
        name = pkg_json["name"].replace("@", "").replace("/", "-")
        version = U.norm_js_version(pkg_json)
        return f"""{name}-{version}.tgz"""

    @staticmethod
    def norm_js_version(pkg):
        """undo some package weirdness"""
        v = pkg["version"]
        final = ""
        # alphas, beta use dashes
        for dashed in v.split("-"):
            if final:
                final += "-"
            for dotted in dashed.split("."):
                if final:
                    final += "."
                if re.findall(r"^\d+$", dotted):
                    final += str(int(dotted))
                else:
                    final += dotted
        return final

    @staticmethod
    def js_deps(pkg_json):
        pkg_dir = pkg_json.parent
        style = pkg_dir / "style"
        schema = pkg_dir / "schema"
        lib = pkg_dir / "lib"
        return [*style.rglob("*.*"), *lib.rglob("*.*"), *schema.glob("*.*")] + (
            [
                pkg_json,
                pkg_dir / "LICENSE",
                pkg_dir / "README.md",
            ]
            if pkg_json != P.META_PKG_JSON
            else []
        )

    @staticmethod
    def make_hashfile(shasums, inputs):
        if shasums.exists():
            shasums.unlink()

        if not shasums.parent.exists():
            shasums.parent.mkdir(parents=True)

        lines = []

        for p in inputs:
            lines += ["  ".join([hashlib.sha256(p.read_bytes()).hexdigest(), p.name])]

        output = "\n".join(lines)
        print(output)
        shasums.write_text(output)


class B:
    """built things"""

    BUILD = P.ROOT / "build"
    CORE_SCHEMA_SRC = P.CORE_SRC / C.SCHEMA_DTS
    CORE_SCHEMA_LIB = P.CORE_LIB / C.SCHEMA_DTS
    ALL_CORE_SCHEMA = [CORE_SCHEMA_SRC, CORE_SCHEMA_LIB]
    META_BUILDINFO = P.META / C.TSBUILDINFO
    ATEST_OUT = BUILD / "atest"
    LABEXT = P.PY_SRC / "labextensions"
    WHEEL = P.DIST / f"""jupyterlab_fonts-{D.CORE_PKG_VERSION}-py3-none-any.whl"""
    SDIST = P.DIST / f"""jupyterlab-fonts-{D.CORE_PKG_VERSION}.tar.gz"""
    JS_TARBALL = {
        k: P.DIST / U.npm_tgz_name(v)
        for k, v in D.PKG_JSON_DATA.items()
        if k != P.META_PKG_JSON
    }
    ALL_PY_DIST = [WHEEL, SDIST]
    ALL_HASH_DEPS = [*ALL_PY_DIST, *JS_TARBALL.values()]
    SHA256SUMS = P.DIST / "SHA256SUMS"


def task_setup():
    """perform early setup"""
    # trust the cache
    if not (C.CI and P.YARN_INTEGRITY.exists()):
        yield dict(
            name="js",
            actions=[
                [
                    *C.JLPM,
                    "--prefer-offline",
                    "--ignore-optional",
                    *(["--frozen-lockfile"] if C.CI else []),
                ],
                [*C.JLPM, "yarn-deduplicate", "-s", "fewer", "--fail"],
            ],
            targets=[P.YARN_INTEGRITY],
            file_dep=[
                *P.ALL_PACKAGE_JSONS,
                *([P.YARN_LOCK] if P.YARN_LOCK.exists() else []),
            ],
        )

    yield dict(
        name="pip",
        actions=[[*C.PIP, "install", "--no-deps", "--ignore-installed", "-e", "."]],
        file_dep=[*B.ALL_PY_DIST],
    )

    yield dict(
        name="ext",
        actions=[
            [
                *C.PY,
                P.ROOT / "scripts/_labextension.py",
                "develop",
                "--overwrite",
                "jupyterlab_fonts",
            ]
        ],
        file_dep=[*B.ALL_PY_DIST],
        task_dep=["setup:pip"],
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
        ext_pkg_json = B.LABEXT / name / "package.json"
        ext_pkg_jsons += [ext_pkg_json]
        yield dict(
            name=f"ext:{name}",
            file_dep=[B.META_BUILDINFO, *U.js_deps(pkg_json)],
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
        file_dep=[*ext_pkg_jsons, *P.ALL_PY_SRC, P.LICENSE, P.README, *P.PY_SETUP],
        actions=[[*C.PY, "setup.py", "sdist", "bdist_wheel"]],
        targets=[*B.ALL_PY_DIST],
    )


def task_binder():
    """get ready for interactive development"""
    yield dict(
        name="labextensions",
        task_dep=["setup"],
        actions=[[*C.JPY, "labextension", "list"]],
    )
    yield dict(name="all", task_dep=["binder:labextensions"], actions=[["echo", "ok"]])


def task_lab():
    yield dict(
        name="launch",
        task_dep=["binder"],
        actions=[["jupyter", "lab", "--no-browser", "--debug"]],
    )


def task_dist():
    for pkg_json, tgz in B.JS_TARBALL.items():
        yield dict(
            name=f"js:{tgz.name}",
            actions=[
                (doit.tools.create_folder, [P.DIST]),
                doit.action.CmdAction(
                    ["npm", "pack", pkg_json.parent], shell=False, cwd=P.DIST
                ),
            ],
            file_dep=[B.META_BUILDINFO, *U.js_deps(pkg_json)],
            targets=[tgz],
        )
    yield dict(
        name="shasums",
        actions=[(U.make_hashfile, [B.SHA256SUMS, B.ALL_HASH_DEPS])],
        targets=[B.SHA256SUMS],
        file_dep=[*B.ALL_HASH_DEPS],
    )


def task_watch():
    yield dict(
        name="ts",
        task_dep=["setup"],
        actions=[[*C.LERNA, "run", "--stream", "--parallel", "watch"]],
    )


def task_lint():
    """apply source formatting, check for mistakes"""
    yield dict(
        name="black",
        actions=[["isort", *P.ALL_PY], ["ssort", *P.ALL_PY], ["black", *P.ALL_PY]],
        file_dep=[*P.ALL_PY],
    )

    yield dict(
        name="robot",
        actions=[[*C.PYM, "robotidy", *P.ALL_ROBOT]],
        file_dep=P.ALL_ROBOT,
    )

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


def task_test():
    file_dep = [*P.ALL_ROBOT]
    task_dep = []

    if not C.CI:
        file_dep += [
            B.LABEXT / pkg_data["name"] / "package.json"
            for pkg_json, pkg_data in D.PKG_JSON_DATA.items()
            if pkg_json != P.META_PKG_JSON
        ]
        task_dep += ["setup"]

    yield dict(
        name="robot",
        actions=[
            (doit.tools.create_folder, [B.ATEST_OUT]),
            doit.action.CmdAction(
                [
                    *C.PYM,
                    "robot",
                    *C.ATEST_ARGS,
                    P.ATEST,
                ],
                shell=False,
                cwd=B.ATEST_OUT,
            ),
        ],
        file_dep=file_dep,
        task_dep=task_dep,
    )


DOIT_CONFIG = {
    "backend": "sqlite3",
    "verbosity": 2,
    "par_type": "thread",
    "default_tasks": ["binder"],
}
