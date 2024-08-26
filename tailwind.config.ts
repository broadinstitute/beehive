/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    screens: {
      tablet: "750px",
      laptop: "1000px",
      desktop: "1750px",
      ultrawide: "2750px",
    },
    extend: {
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
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
          "misc-heavy-bg",
          "misc-heavy-border",
          "misc-light-bg",
          "misc-light-border",

          "error-bg",
          "error-border",
          "error-button",

          "beehive-logo",

          "status-red",
          "status-green",
          "status-yellow",
          "status-gray",
        ].map((name) => [
          `color-${name}`,
          `rgb(var(--color-${name}, 255 0 0) / <alpha-value>)`,
        ]),
      ),
    },
  },
};
