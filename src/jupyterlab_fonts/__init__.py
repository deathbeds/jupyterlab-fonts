""""main importable for jupyterlab-fonts."""
from ._version import __pkg__, __prefix__, __version__


def _jupyter_labextension_paths():
    return [
        {
            "src": str(pkg.parent.relative_to(__prefix__).as_posix()),
            "dest": pkg_name,
        }
        for pkg_name, pkg in __pkg__.items()
    ]


__all__ = [
    "__version__",
    "_jupyter_labextension_paths",
]
