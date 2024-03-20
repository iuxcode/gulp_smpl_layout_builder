import config from "./config.mjs";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: config.tailwind.content,
  darkMode: "class",
  theme: {
    extend: {},
  },
};
