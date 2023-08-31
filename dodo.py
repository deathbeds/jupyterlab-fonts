"""project automation for jupyterlab-fonts."""
import json
import os
import platform
import shutil
import sys
from pathlib import Path

from doitoml import DoiTOML
from ruamel.yaml import safe_load


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
            shutil.which("python")
            or shutil.which("python3")
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


# handle dynamic sys.prefix
os.environ.update(
    {
        k: str(v)
        for k, v in {
            "CONDA_EXE": C.CONDA_EXE,
            "DEFAULT_LAB": C.DEFAULT_LAB,
            "JLF_LAB": C.JLF_LAB,
            "JLF_SYS_PREFIX": P.SYS_PREFIX,
            "THIS_PY": C.THIS_PY,
            "THIS_SUBDIR": C.THIS_SUBDIR,
        }.items()
    },
)

# configure doitoml, allowing changing `sys.prefix` in CI
doitoml = DoiTOML(
    config_paths=[P.ROOT / "pyproject.toml"],
    safe_paths=P.SAFE_PATHS,
)
dt_dict = doitoml.config.to_dict()
globals().update(doitoml.tasks())


# class C:
#     """constants"""

#     LERNA = [*JLPM, "lerna"]
#     PY = [sys.executable]
#     PYM = [*PY, "-m"]
#     PIP = [*PYM, "pip"]
#     JPY = [*PYM, "jupyter"]
#     SCHEMA_DTS = "_schema.d.ts"
#     TSBUILDINFO = "tsconfig.tsbuildinfo"
#     ENC = dict(encoding="utf-8")
#     CORE_EXT = "@deathbeds/"
#     CI = bool(json.loads(os.environ.get("CI", "0")))
#     ATEST_ARGS = json.loads(os.environ.get("ATEST_ARGS", "[]"))
#     WITH_JS_COV = bool(json.loads(os.environ.get("WITH_JS_COV", "0")))
#     NYC = [*JLPM, "nyc", "report"]
#     PABOT_DEFAULTS = [
#         "--artifactsinsubfolders",
#         "--artifacts",
#         "png,log,txt,svg,ipynb,json",
#     ]
#     PLATFORM = platform.system()
#     PY_VERSION = "{}.{}".format(sys.version_info[0], sys.version_info[1])
#     TESTING_IN_CI = json.loads(os.environ.get("TESTING_IN_CI", "[]"))


# class P:
#     """paths"""

#     DODO = Path(__file__)
#     ROOT = DODO.parent
#     GH = ROOT / ".github"
#     LICENSE = ROOT / "LICENSE"
#     README = ROOT / "README.md"
#     BINDER = ROOT / ".binder"
#     DIST = ROOT / "dist"
#     PACKAGES = ROOT / "packages"
#     ATEST = ROOT / "atest"
#     CORE = PACKAGES / "jupyterlab-fonts"
#     CORE_PKG_JSON = CORE / "package.json"
#     CORE_SRC = CORE / "src"
#     CORE_LIB = CORE / "lib"

#     META = PACKAGES / "_meta"
#     META_PKG_JSON = META / "package.json"

#     PY_SRC = ROOT / "src/jupyterlab_fonts"
#     PY_SETUP = [ROOT / "setup.cfg", ROOT / "setup.py", ROOT / "MANIFEST.in"]
#     ALL_PY_SRC = [*PY_SRC.rglob("*.py")]

#     PACKAGE_JSONS = [*PACKAGES.glob("*/package.json")]
#     ROOT_PACKAGE_JSON = ROOT / "package.json"
#     ALL_PACKAGE_JSONS = [ROOT_PACKAGE_JSON, *PACKAGE_JSONS]
#     NODE_MODULES = ROOT / "node_modules"
#     YARN_INTEGRITY = NODE_MODULES / ".yarn-integrity"
#     YARN_LOCK = ROOT / "yarn.lock"
#     ESLINTRC = ROOT / ".eslintrc.js"

#     ALL_ROBOT = [*ATEST.rglob("*.robot"), *ATEST.rglob("*.resource")]

#     ALL_SCHEMA = [*PACKAGES.glob("*/schema/*.json")]
#     ALL_YAML = [*BINDER.glob("*.yml"), *GH.rglob("*.yml")]
#     ALL_TS = [*PACKAGES.glob("*/src/**/*.ts"), *PACKAGES.glob("*/src/**/*.tsx")]
#     ALL_MD = [*ROOT.glob("*.md"), *PACKAGES.glob("*/*.md")]
#     ALL_JSON = [*ALL_PACKAGE_JSONS, *BINDER.glob("*.json"), *ALL_SCHEMA]
#     ALL_PRETTIER = [*ALL_JSON, *ALL_MD, *ALL_TS, *ALL_YAML]
#     ALL_ESLINT = [*ALL_TS]
#     ALL_PY = [*ROOT.glob("*.py"), *ALL_PY_SRC]


# class D:
#     PKG_JSON_DATA = {
#         pkg_json: json.loads(pkg_json.read_text(**C.ENC))
#         for pkg_json in P.PACKAGE_JSONS
#     }
#     CORE_PKG_DATA = PKG_JSON_DATA[P.CORE_PKG_JSON]
#     CORE_PKG_VERSION = CORE_PKG_DATA["version"]


# class U:
#     def npm_tgz_name(pkg_json):
#         name = pkg_json["name"].replace("@", "").replace("/", "-")
#         version = U.norm_js_version(pkg_json)
#         return f"""{name}-{version}.tgz"""

#     def norm_js_version(pkg):
#         """undo some package weirdness"""
#         v = pkg["version"]
#         final = ""
#         # alphas, beta use dashes
#         for dashed in v.split("-"):
#             if final:
#                 final += "-"
#             for dotted in dashed.split("."):
#                 if final:
#                     final += "."
#                 if re.findall(r"^\d+$", dotted):
#                     final += str(int(dotted))
#                 else:
#                     final += dotted
#         return final

#     def js_deps(pkg_json):
#         pkg_dir = pkg_json.parent
#         style = pkg_dir / "style"
#         schema = pkg_dir / "schema"
#         lib = pkg_dir / "lib"
#         return [*style.rglob("*.*"), *lib.rglob("*.*"), *schema.glob("*.*")] + (
#             [
#                 pkg_json,
#                 pkg_dir / "LICENSE",
#                 pkg_dir / "README.md",
#             ]
#             if pkg_json != P.META_PKG_JSON
#             else []
#         )

#     def make_hashfile(shasums, inputs):
#         if shasums.exists():
#             shasums.unlink()

#         if not shasums.parent.exists():
#             shasums.parent.mkdir(parents=True)

#         lines = []

#         for p in inputs:
#             lines += ["  ".join([hashlib.sha256(p.read_bytes()).hexdigest(), p.name])]

#         output = "\n".join(lines)
#         print(output)
#         shasums.write_text(output)

#     def clean_some(*paths):

#         for path in paths:
#             if path.is_dir():
#                 shutil.rmtree(path)
#             elif path.exists():
#                 path.unlink()


# class B:
#     """built things"""

#     BUILD = P.ROOT / "build"
#     REPORTS = BUILD / "reports"
#     CORE_SCHEMA_SRC = P.CORE_SRC / C.SCHEMA_DTS
#     CORE_SCHEMA_LIB = P.CORE_LIB / C.SCHEMA_DTS
#     ALL_CORE_SCHEMA = [CORE_SCHEMA_SRC, CORE_SCHEMA_LIB]
#     META_BUILDINFO = P.META / C.TSBUILDINFO
#     REPORTS_COV_XML = REPORTS / "coverage-xml"
#     PYTEST_HTML = REPORTS / "pytest.html"
#     PYTEST_COV_XML = REPORTS_COV_XML / "pytest.coverage.xml"
#     HTMLCOV_HTML = REPORTS / "htmlcov/index.html"
#     ATEST_OUT = REPORTS / "atest"
#     ROBOCOV = BUILD / "__robocov__"
#     REPORTS_NYC = REPORTS / "nyc"
#     REPORTS_NYC_LCOV = REPORTS_NYC / "lcov.info"
#     LABEXT = P.PY_SRC / "labextensions"
#     WHEEL = P.DIST / f"""jupyterlab_fonts-{D.CORE_PKG_VERSION}-py3-none-any.whl"""
#     SDIST = P.DIST / f"""jupyterlab-fonts-{D.CORE_PKG_VERSION}.tar.gz"""
#     JS_TARBALL = {
#         k: P.DIST / U.npm_tgz_name(v)
#         for k, v in D.PKG_JSON_DATA.items()
#         if k != P.META_PKG_JSON
#     }
#     ALL_PY_DIST = [WHEEL, SDIST]
#     ALL_HASH_DEPS = [*ALL_PY_DIST, *JS_TARBALL.values()]
#     SHA256SUMS = P.DIST / "SHA256SUMS"


# def task_setup():
#     """perform early setup"""
#     # trust the cache
#     if C.TESTING_IN_CI:
#         return

#     if not (C.CI and P.YARN_INTEGRITY.exists()):
#         yield dict(
#             name="js",
#             actions=[
#                 [
#                     *C.JLPM,
#                     "--prefer-offline",
#                     "--ignore-optional",
#                     *(["--frozen-lockfile"] if C.CI else []),
#                 ],
#                 [*C.JLPM, "yarn-deduplicate", "-s", "fewer", "--fail"],
#             ],
#             targets=[P.YARN_INTEGRITY],
#             file_dep=[
#                 *P.ALL_PACKAGE_JSONS,
#                 *([P.YARN_LOCK] if P.YARN_LOCK.exists() else []),
#             ],
#         )

#     yield dict(
#         name="pip",
#         actions=[[*C.PIP, "install", "--no-deps", "--ignore-installed", "-e", "."]],
#         file_dep=[*B.ALL_PY_DIST],
#     )

#     yield dict(
#         name="ext",
#         actions=[
#             [
#                 *C.PY,
#                 P.ROOT / "scripts/_labextension.py",
#                 "develop",
#                 "--overwrite",
#                 "jupyterlab_fonts",
#             ]
#         ],
#         file_dep=[*B.ALL_PY_DIST],
#         task_dep=["setup:pip"],
#     )


# def task_build():
#     yield dict(
#         name="js:pre",
#         actions=[[*C.LERNA, "run", "prebuild"]],
#         file_dep=[P.YARN_INTEGRITY],
#         targets=[*B.ALL_CORE_SCHEMA],
#     )

#     yield dict(
#         name="js:tsc",
#         actions=[[*C.LERNA, "run", "build"]],
#         file_dep=[P.YARN_INTEGRITY, *P.ALL_TS, *B.ALL_CORE_SCHEMA],
#         targets=[B.META_BUILDINFO],
#     )

#     ext_pkg_jsons = []
#     if C.WITH_JS_COV:
#         file_dep = [P.YARN_INTEGRITY, *B.ALL_CORE_SCHEMA]
#     else:
#         file_dep = [B.META_BUILDINFO]

#     for pkg_json, pkg in D.PKG_JSON_DATA.items():
#         if "jupyterlab" not in pkg:
#             continue
#         name = pkg["name"]
#         ext_pkg_json = B.LABEXT / name / "package.json"
#         ext_pkg_jsons += [ext_pkg_json]
#         scope_args = [*C.LERNA, "run", "--scope", name]
#         if C.WITH_JS_COV:
#             actions = [
#                 [*scope_args, "labextension:build:cov"],
#             ]
#         else:
#             actions = [[*scope_args, "labextension:build"]]
#         yield dict(
#             name=f"ext:{name}",
#             uptodate=[doit.tools.config_changed(dict(cov=C.WITH_JS_COV))],
#             file_dep=[*file_dep, *U.js_deps(pkg_json)],
#             actions=actions,
#             targets=[ext_pkg_json],
#         )

#     yield dict(
#         name="py",
#         file_dep=[*ext_pkg_jsons, *P.ALL_PY_SRC, P.LICENSE, P.README, *P.PY_SETUP],
#         actions=[[*C.PY, "setup.py", "sdist", "bdist_wheel"]],
#         targets=[*B.ALL_PY_DIST],
#     )


# def task_binder():
#     """get ready for interactive development"""
#     yield dict(
#         name="labextensions",
#         task_dep=["setup"],
#         actions=[[*C.JPY, "labextension", "list"]],
#     )
#     yield dict(name="all", task_dep=["binder:labextensions"], actions=[["echo", "ok"]])
