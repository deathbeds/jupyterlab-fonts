import os
from setuptools import setup

name = "nbjss"
__version__ = None


with open(os.path.join(name, "_version.py")) as fp:
    exec(fp.read())


setup_args = dict(
    name="nbjss",
    version=__version__,
    description="Define notebook JSS styles in metadata for nbconvert",
    url="http://github.com/deathbeds/jyve",
    author="Dead Pixel Collective",
    license="BSD-3-Clause",
    packages=[name],
    setup_requires=["nbconvert"],
    zip_safe=False,
)

if __name__ == "__main__":
    setup(**setup_args)
