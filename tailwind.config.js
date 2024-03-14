const options = require("./configs.js"); //options from config.js

const plugins = {
  // typography: require("@tailwindcss/typography"),
  // forms: require("@tailwindcss/forms"),
  // containerQueries: require("@tailwindcss/container-queries"),
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: Object.keys(plugins)
    .filter((k) => options.config.plugins[k])
    .map((k) => {
      if (k in options.config.plugins && options.config.plugins[k]) {
        return plugins[k];
      }
    }),
};
