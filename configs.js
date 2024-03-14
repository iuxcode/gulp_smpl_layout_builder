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
  tailwind: {
    config: "./tailwind.config.js",
    plugins: {
      // typography: true,
      // forms: true,
      // containerQueries: true,
    }
  },
};

// Directories
const baseDir = "src";
const distDir = "dist";

const html_components = `${baseDir}/views/components/**/*.html`;
const html_partials = `${baseDir}/views/partials/**/*.html`;
const html = `${baseDir}/views/**/*.html`

const paths = {
  baseDir,
  distDir,
  html_components,
  html_partials,
  html: {
    src: [
      html,
      `!${html_components}`, // ignore
      `!${html_partials}`, // ignore
    ],
    dest: distDir,
    watch: html,
  },
  styles: {
    src: "src/scss/**/*.scss",
    dest: `${distDir}/public/css`,
  },
  scripts: {
    entries: ["src/typescript/main.ts"],
    src: "src/typescript/**/*.ts",
    dest: `${distDir}/public/js`,
  },
  image: {
    src: "src/assets/image/**",
    dest: `${distDir}/public/assets/image`,
  }
}

module.exports = {
  config,
  paths,
};
