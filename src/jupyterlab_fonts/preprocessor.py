import os
import json


from traitlets import UseEnum

from nbconvert.preprocessors.base import Preprocessor

from .constants import METADATA_KEY, StaticStrategy

here = os.path.dirname(__file__)
static = os.path.join(here, "static")
nbjss_js = os.path.join(static, "nbjss.js")
nbjss_jss = os.path.join(static, "nbjss.jss.json")


class JSSHeaderPreprocessor(Preprocessor):
    """Adds a bunch of nasty CSS and JavaScript to make fonts pretty."""

    static_strategy = UseEnum(
        StaticStrategy,
        default_value=StaticStrategy.inline_js,
        config=True,
        help="A strategy for applying style from JSS.. only `inline_js` implemented",
    )

    def normalize_jss(self, nb, resources):
        jss = nb.metadata.get(METADATA_KEY)
        if jss is None:
            return

        try:
            if not jss["styles"].get(":root"):
                jss["styles"].pop(":root", None)
        except Exception:
            return False

        for key in list(jss.keys()):
            if not jss[key]:
                del jss[key]

        return jss

    def preprocess(self, nb, resources):
        msg_tmpl = " Adding %s bytes of fonts, style, and scripts%s"

        jss = self.normalize_jss(nb, resources)

        # any falsey value
        if not jss:
            self.log.info(msg_tmpl, 0, " (skipping nbjss)")
            return nb, resources
        inlining = resources.setdefault("inlining", {})
        inlining.setdefault("css", "")

        css = None

        if self.static_strategy == StaticStrategy.inline_js:
            css = self.strategy_inline_js(jss, resources)
        else:
            raise NotImplementedError(
                "Sorry, {} is not yet supported for static_strategy".format(
                    self.static_strategy
                )
            )

        if css is not None:
            self.log.info(msg_tmpl, len(css), " (nbjss).")
            inlining["css"] += [css]

        return nb, resources

    @property
    def nbjss_jss_json(self):
        with open(nbjss_jss) as fp:
            return json.load(fp)

    @property
    def nbjss_js(self):
        with open(nbjss_js) as fp:
            return fp.read()

    def strategy_inline_js(self, jss, resources):
        """Embed"""
        css = """</style>
        <script>%s</script>
        <script>
            ;(function(){
                nbjss.createStyleSheet(%s).attach();
                nbjss.createStyleSheet(%s).attach();
            }).call(this);
        </script>
        <style>/* this is not style */""" % (
            self.nbjss_js,
            json.dumps({"@global": self.nbjss_jss_json}),
            json.dumps(
                {
                    "@global": jss.get("styles", {}),
                    "@font-face": sum(jss.get("fonts", {}).values(), []),
                },
                indent=2,
            ),
        )
        return css
