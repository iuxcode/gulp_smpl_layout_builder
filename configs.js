const config = {
  // server port
  port: 3000,
  // Decide which URL to open automatically when Browsersync starts.
  // Defaults to "local" if none set.
  // Can be true, local, external, ui, ui-external, tunnel or false
  open: false,
  // Browsersync includes a user-interface
  uiPort: 5000,
  // Tailwind config
  tailwindjs: "./tailwind.config.js",
};

// tailwind plugins
const tailwindPlugins = {
  // typography: true,
  // forms: true,
  // containerQueries: true,
};

// Directories
const distPath = "dist";

const html_components = "src/views/components/**/*.html";
const html_parts = "src/views/partials/**/*.html";
const htmlDirectory = "src/views/**/*.html";

const paths = {
  dist: distPath,
  htmlDirectory,
  html_components,
  html_parts,
  html: {
    src: [
      htmlDirectory,
      `!${html_components}`, // ignore
      `!${html_parts}`, // ignore
    ],
    dest: distPath,
  },
  styles: {
    src: "src/scss/**/*.scss",
    dest: distPath + "/public/css"
  },
  scripts: {
    src: "src/typescript/**/*.ts",
    dest: distPath + "/public/js"
  },
  image: {
    src: "src/assets/image/**",
    dest: distPath + "/public/assets/image"
  }
}

module.exports = {
  config,
  tailwindPlugins,
  paths,
};
