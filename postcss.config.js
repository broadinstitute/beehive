module.exports = {
  plugins: [
    // Turn @import-glob directives into @import directives
    require("postcss-import-ext-glob"),
    // Resolve all @import directives
    require("postcss-import"),
    // Generate Tailwind CSS
    require("tailwindcss"),
    // Add browser prefixes to CSS to improve compatibility
    require("autoprefixer"),
    // Minify everything
    require("cssnano"),
    // Don't swallow warnings in any of the above
    require("postcss-fail-on-warn"),
  ],
};
