export default {
  plugins: {
    // Turn @import-glob directives into @import directives
    "postcss-import-ext-glob": {},
    // Resolve all @import directives
    "postcss-import": {},
    // Generate Tailwind CSS
    tailwindcss: {},
    // Add browser prefixes to CSS to improve compatibility
    autoprefixer: {},
    // Don't swallow warnings in any of the above
    "postcss-fail-on-warn": {},
  },
};
