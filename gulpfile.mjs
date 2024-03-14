"use strict";

import gulp from "gulp";
import fileinclude from "gulp-file-include";
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
import uglify from "gulp-terser";
import clean from "gulp-clean";
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import tsify from 'tsify';
import sourcemaps from 'gulp-sourcemaps';
import buffer from 'vinyl-buffer';
import babelify from 'babelify';
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
  return browserify({
    basedir: '.',
    debug: true,
    entries: paths.scripts.entries,
    cache: {},
    packageCache: {}
  })
    .plugin(tsify)
    .transform(babelify, {
      presets: ['@babel/preset-env'],
      extensions: ['.ts']
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
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
    .pipe(postcss([tailwindcss(config.tailwind)]))
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
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
  return gulp.src(paths.html.src)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
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
  return gulp.src(paths.distDir, { read: false, allowEmpty: true }).pipe(
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
  gulp.watch(
    paths.html.watch,
    gulp.series(build_html, build_styles, hotReload),
  );
  gulp.watch(
    paths.styles.src,
    gulp.series(build_styles, hotReload),
  );
  gulp.watch(
    paths.scripts.src,
    gulp.series(build_ts, hotReload),
  );
  gulp.watch(
    paths.image.src,
    gulp.series(build_images, hotReload),
  );
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
