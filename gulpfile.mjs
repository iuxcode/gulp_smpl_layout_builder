"use strict";

import gulp from "gulp";
import typescript from "gulp-typescript";
import rename from "gulp-rename";
import plumber from "gulp-plumber";
import { onError } from "gulp-notify";
import autoprefixer from "gulp-autoprefixer";
import prettify from "gulp-prettify";
import imagemin, { svgo, optipng, gifsicle } from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import mozjpeg from 'imagemin-mozjpeg';
import changed from 'gulp-changed';
import _browserSync from "browser-sync";
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from "gulp-postcss";
import packageImporter from "node-sass-package-importer";
import tailwindcss from "tailwindcss";
import concat from "gulp-concat";
import uglify from "gulp-terser";
import clean from "gulp-clean";
import { paths, config } from "./configs.js";

const browserSync = _browserSync.create();


function errorHandler(err) {
  if (err || (stats && stats.compilation.errors.length > 0)) {
    console.error(
      "\n",
      "[-] Something went wrong: " + err.message + "\n",
      JSON.stringify(err, 2)
    )

    const error = err || stats.compilation.errors[0].error;
    onError({ message: "<%= error.message %>" })(error);
    this.emit("end");
  }
}

// typescript
function build_ts() {
  var tsProject = typescript.createProject('tsconfig.json');

  return gulp.src(paths.scripts.src)
    .pipe(tsProject())
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.dest));
}

// scss
function build_styles() {
  const sass = gulpSass(dartSass);

  return gulp.src(paths.styles.src)
    .pipe(plumber({ errorHandler: errorHandler }))
    .pipe(
      sass({
        outputStyle: "expanded",
        importer: packageImporter({
          extensions: [".scss", ".css"]
        })
      })
    )
    // .pipe(postcss([tailwindcss(config.tailwindjs), autoprefixer()]))
    .pipe(postcss([tailwindcss(config.tailwindjs)]))
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(
      rename(function (path) {
        if (/^style_/.test(path.basename)) {
          path.basename = "style_latest";
        }
      })
    )
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// html
function build_html() {
  return gulp.src(paths.html.src, { since: gulp.lastRun(build_html) })
    .pipe(
      prettify({
        indent_char: " ",
        indent_size: 2,
        unformatted: ["a", "span", "br"]
      })
    )
    .pipe(gulp.dest(paths.html.dest));
}

// images
function build_images() {
  return gulp.src(paths.image.src)
    .pipe(plumber({ errorHandler: errorHandler }))
    .pipe(changed(paths.image.dest))
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
    .pipe(gulp.dest(paths.image.dest))
}

// Load Previews on Browser on dev
function livePreview(done) {
  browserSync.init({
    open: config.open,
    port: config.port,
    ui: {
      port: config.uiPort,
    },
    server: {
      baseDir: paths.html.dest, // output directory,
      index: "index.html"
    }
  });
  done();
}

// Triggers Browser reload
function hotReload(done) {
  browserSync.reload();
  done();
  console.info("[+] Browser reload completed");
}

// Cleaning dist folder for fresh start.
function cleanDist() {
  console.log(
    "\n",
    "[!] Cleaning dist folder for fresh start.\n"
  );
  return gulp.src(paths.dist, { read: false, allowEmpty: true }).pipe(
    clean()
  );
}

// Production build is complete
function buildFinish(done) {
  console.log(
    "\n\t",
    `[+] Production build is complete. Files are located at ${options.paths.build.base}\n`
  );
  done();
}

// watch
function watchFiles(done) {
  gulp.watch(paths.html.src, gulp.series(build_html, build_styles, hotReload));
  gulp.watch(paths.styles.src, gulp.series(build_styles, hotReload));
  gulp.watch(paths.scripts.src, build_ts);
  gulp.watch(paths.image.src, build_images);
  done();
}

// commands
const _default = gulp.series(
  cleanDist,
  gulp.parallel(build_styles, build_html, build_ts, build_images),
  livePreview, watchFiles
);

const _prod = gulp.series(
  cleanDist,
  gulp.parallel(build_styles, build_html, build_ts, build_images),
  buildFinish,
);

export { _default as default, _prod as prod };
