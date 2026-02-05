const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("images/uploads");
  eleventyConfig.addPassthroughCopy("files");
  eleventyConfig.addPassthroughCopy("robots.txt");

  // Date filter for blog posts
  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });

  // ISO date filter for sitemap
  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toISODate();
  });

  // RFC 822 date filter for RSS feed
  eleventyConfig.addFilter("rssDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toRFC2822();
  });

  // Limit filter for home page recent posts
  eleventyConfig.addFilter("limit", (array, limit) => {
    return array.slice(0, limit);
  });

  // Collections
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("blog/**/*.md")
      .filter((item) => item.data.tags && item.data.tags.includes("post"))
      .reverse();
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
