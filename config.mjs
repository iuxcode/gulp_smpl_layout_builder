const BASE_DIST_DIR = "./dist";
const BASE_DIR = "./src";

export default {
  BASE_DIR,
  BASE_DIST_DIR,

  js: {
    mainEntry: `${BASE_DIR}/scripts/main.ts`,
    entries: `${BASE_DIR}/scripts/**/*.ts`,
    outDir: `${BASE_DIST_DIR}/public/js`,
    outputFile: "[name].js"
  },

  pug: {
    entries: `${BASE_DIR}/pug/*.pug`,
    outDir: BASE_DIST_DIR
  },

  sass: {
    entries: `${BASE_DIR}/styles/*.scss`,
    outDir: `${BASE_DIST_DIR}/public/css`,
  },

  assets: {
    images: {
      src: `${BASE_DIR}/assets/images/**`,
      dest: `${BASE_DIST_DIR}/public/assets/images`
    }
  },

  tailwind: {
    content: [`${BASE_DIR}/**/*.{html,pug,js,ts,jsx,tsx}`]
  },

  browserSync: {
    open: false,
    port: 3000,
    uiPort: 3000,
    dest: BASE_DIST_DIR,
    notify: false,
    ui: false,
    online: false,
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: false
    }
  },

  watch: {
    sass: [`${BASE_DIR}/styles/**/*.scss`],
    js: [`${BASE_DIR}/scripts/**/*.*`],
    pug: [`${BASE_DIR}/pug/**/*.pug`],
    watchConfig: true
  }
};
