"""jupyterlab-fonts metadata tests."""
import jupyterlab_fonts

EXPECTED_EXT_COUNT = 5


def test_version():
    """It has a version."""
    assert jupyterlab_fonts.__version__, "no version"


def test_magic_lab_extensions():
    """It has the expected number of labextensions."""
    assert (
        len(jupyterlab_fonts._jupyter_labextension_paths()) == EXPECTED_EXT_COUNT
    ), "too many/few labextensions"
