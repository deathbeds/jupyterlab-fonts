import json
from pathlib import Path

HERE = Path(__file__).parent
NAME = "jupyterlab-fonts"
EXT = HERE / "src/jupyterlab_fonts/labextensions/@deathbeds"
CORE = EXT / NAME

__js__ = json.loads((CORE / "package.json").read_text(encoding="utf-8"))

SHARE = "share/jupyter/labextensions"
FILES = []

for package_json in EXT.glob("*/package.json"):
    pkg = json.loads(package_json.read_text(encoding="utf-8"))

    FILES += [(f"""{SHARE}/{pkg["name"]}""", ["src/jupyterlab_fonts/install.json"])]

    for path in package_json.parent.rglob("*"):
        if path.is_dir():
            continue

        parent = path.parent.relative_to(package_json.parent).as_posix()
        parent = "" if parent == "." else f"/{parent}"
        FILES += [
            (
                f"""{SHARE}/{pkg["name"]}{parent}""",
                [str(path.relative_to(HERE).as_posix())],
            )
        ]


if __name__ == "__main__":
    import setuptools

    setuptools.setup(
        name=NAME,
        version=__js__["version"],
        data_files=FILES,
        description=__js__["description"],
        url=__js__["repository"]["url"],
        author=__js__["author"],
        license=__js__["license"],
        project_urls={
            "Bug Tracker": __js__["bugs"]["url"],
            "Source Code": __js__["repository"]["url"],
            "Changelog": f"""{__js__["repository"]["url"]}/blob/master/CHANGELOG.md""",
        },
    )
