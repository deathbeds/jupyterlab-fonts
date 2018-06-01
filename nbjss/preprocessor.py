from nbconvert.preprocessors.base import Preprocessor

from .constants import METADATA_KEY, ROOT


class JSSHeaderPreprocessor(Preprocessor):
    def preprocess(self, nb, resources):
        jss = nb.metadata.get(METADATA_KEY)
        if jss is not None:
            css = self._generate_header(jss, resources)
            if css:
                inlining = resources.setdefault("inlining", {})
                inlining.setdefault("css", "")
                inlining["css"] += "\n".join(css)
                print(inlining["css"])

        return nb, resources

    def _generate_header(self, jss, resources):
        for selector, styles in jss.get("styles", {}).items():
            gen = None
            if selector == ROOT:
                gen = self._root(styles)

            if gen is not None:
                for line in gen:
                    yield line

    def _root(self, jss):
        yield ":root {"
        for key, val in jss.items():
            yield "{}: {};".format(key, val)
        yield "}"
