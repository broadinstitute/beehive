/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      colors: Object.fromEntries(
        [
          "far-bg",
          "near-bg",
          "nearest-bg",

          "header-text",
          "body-text",
          "placeholder-text",
          "link-underline",

          "focused-element",
          "divider-line",
          "neutral-soft-border",
          "neutral-hard-border",
          "text-box-border",

          "button-down",
          "icon-button-hover",
          "icon-button-down",

          "cluster-bg",
          "cluster-border",
          "environment-bg",
          "environment-border",
          "chart-bg",
          "chart-border",
          "app-version-bg",
          "app-version-border",
          "chart-version-bg",
          "chart-version-border",

          "error-bg",
          "error-border",
          "error-button",

          "beehive-logo",
        ].map((name) => [
          `color-${name}`,
          `rgb(var(--color-${name}, 255 0 0) / <alpha-value>)`,
        ])
      ),
    },
  },
  plugins: [],
};
