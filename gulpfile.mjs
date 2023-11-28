"use strict";
import gulp from "gulp";
import gutil from "gulp-util";
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import packageImporter from "node-sass-package-importer";
import typescript from "gulp-typescript";
import rename from "gulp-rename";
import plumber from "gulp-plumber";
import { onError } from "gulp-notify";
import autoprefixer from "gulp-autoprefixer";
import prettify from "gulp-prettify";
import htmlhint from "gulp-htmlhint";
import imagemin, { svgo, optipng, gifsicle } from 'gulp-imagemin';
import changed from 'gulp-changed';
import pngquant from 'imagemin-pngquant';
import mozjpeg from 'imagemin-mozjpeg';
import _browserSync from "browser-sync";

const browserSync = _browserSync.create();

const PATHS = {
  html: {
    src: "./src/views/**/*.html",
    dest: "./dist"
  },
  styles: {
    src: "./src/scss/**/*.scss",
    dest: "./dist/css"
  },
  scripts: {
    src: "./src/typescript/**/*.ts",
    dest: "./dist/js"
  },
  image: {
    src: "./src/assets/image/**",
    dest: "./dist/assets/image"
  }
};

// methods
function errorHandler(err) {
  if (err || (stats && stats.compilation.errors.length > 0)) {
    const error = err || stats.compilation.errors[0].error;
    onError({ message: "<%= error.message %>" })(error);
    this.emit("end");
  }
}

// html
function html() {
  return gulp.src(PATHS.html.src, { since: gulp.lastRun(html) })
    .pipe(
      prettify({
        indent_char: " ",
        indent_size: 2,
        unformatted: ["a", "span", "br"]
      })
    )
    .pipe(gulp.dest(PATHS.html.dest));
}

// scss
function styles() {
  const sass = gulpSass(dartSass);
  return gulp.src(PATHS.styles.src)
    .pipe(plumber({ errorHandler: errorHandler }))
    .pipe(
      sass({
        outputStyle: "expanded",
        importer: packageImporter({
          extensions: [".scss", ".css"]
        })
      })
    )
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(gulp.dest(PATHS.styles.dest))
    .pipe(
      rename(function (path) {
        if (/^style_/.test(path.basename)) {
          path.basename = "style_latest";
        }
      })
    )
    .pipe(gulp.dest(PATHS.styles.dest))
    .pipe(browserSync.stream());
}

// typescript
function ts() {
  var tsProject = typescript.createProject('tsconfig.json');

  return gulp.src(PATHS.scripts.src)
    .pipe(tsProject())
    .js.pipe(gulp.dest(PATHS.scripts.dest));
}

// images
function image() {
  return gulp.src(PATHS.image.src)
    .pipe(plumber({ errorHandler: errorHandler }))
    .pipe(changed(PATHS.image.dest))
    .pipe(imagemin([
      pngquant({
        quality: '65-80',
        speed: 1,
        floyd: 0,
      }),
      mozjpeg({
        quality: 85,
        progressive: true
      }),
      svgo(),
      optipng(),
      gifsicle()
    ]))
    .pipe(gulp.dest(PATHS.image.dest))
}

// server
const browserSyncOption = {
  open: false,
  port: 3000,
  ui: {
    port: 3001
  },
  server: {
    baseDir: PATHS.html.dest, // output directory,
    index: "index.html"
  }
};
function browsersync(done) {
  browserSync.init(browserSyncOption);
  done();
}

// browser reload
function browserReload(done) {
  browserSync.reload();
  done();
  console.info("Browser reload completed");
}

// watch
function watchFiles(done) {
  gulp.watch(PATHS.html.src, gulp.series(html, browserReload));
  gulp.watch(PATHS.styles.src, styles);
  gulp.watch(PATHS.scripts.src, ts);
  gulp.watch(PATHS.image.src, image);
  done();
}

// commands
const _default = gulp.series(
  gulp.parallel(styles, html, ts, image),
  gulp.series(browsersync, watchFiles)
);
export { _default as default };
