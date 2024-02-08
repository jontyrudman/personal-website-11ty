const pluginRss = require("@11ty/eleventy-plugin-rss");
const sass = require("sass");
const htmlmin = require("html-minifier");

function fixCircularReferences() {
  const defs = {};
  return (k, v) => {
    const def = defs[v];
    if (def && typeof v == "object")
      return "[" + k + " is the same as " + def + "]";
    defs[v] = k;
    return v;
  };
}

module.exports = (eleventyConfig) => {
  eleventyConfig.addTemplateFormats("scss");

  // Creates the extension for use
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css", // optional, default: "html"

    // `compile` is called once per .scss file in the input directory
    compile: async function (inputContent) {
      let result = sass.compileString(inputContent, { style: "compressed" });

      // This is the render function, `data` is the full data cascade
      return async (data) => {
        return result.css;
      };
    },
  });

  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md");
  });

  eleventyConfig.addFilter("json", (val) =>
    JSON.stringify(val, fixCircularReferences(), 2),
  );
  eleventyConfig.addFilter("locale_date", (date) => date.toLocaleDateString());

  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addTransform("htmlmin", function (content) {
    // Prior to Eleventy 2.0: use this.outputPath instead
    if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });
};
