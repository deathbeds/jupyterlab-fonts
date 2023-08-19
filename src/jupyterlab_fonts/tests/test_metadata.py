"""jupyterlab-fonts metadata tests."""
import jupyterlab_fonts


def test_version():
    assert jupyterlab_fonts.__version__, "no version"


def test_magic_lab_extensions():
    assert (
        len(jupyterlab_fonts._jupyter_labextension_paths()) == 4
    ), "too many/few labextensions"
