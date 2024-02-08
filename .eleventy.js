const rssPlugin = require("@11ty/eleventy-plugin-rss");
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

  // Compile SCSS
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

  // Register posts
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md");
  });

  // json filter without circular ref issues
  eleventyConfig.addFilter("json", (val) =>
    JSON.stringify(val, fixCircularReferences(), 2),
  );
  // locale date string filter
  eleventyConfig.addFilter("locale_date", (date) => date.toLocaleDateString());

  // RSS feed generation
  eleventyConfig.addPlugin(rssPlugin);

  // Minify HTML
  eleventyConfig.addTransform("htmlmin", function (content) {
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
