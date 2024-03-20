import gulp from 'gulp';
import _browserSync from "browser-sync";
import rename from "gulp-rename";
import plumber from 'gulp-plumber';
import beautify from 'gulp-beautify';
import pug from 'gulp-pug';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from "gulp-postcss";
import uglyCss from "gulp-clean-css";
import autoprefixer from "gulp-autoprefixer";
import packageImporter from "node-sass-package-importer";
import webpack from 'webpack-stream';
import clean from "gulp-clean";
import webpackConfig from './webpack.config.mjs';
import config from './config.mjs';

const browserSync = _browserSync.create();

function flushModule(path, callback) {
  // delete require.cache[require.resolve(path)];
  callback();
}

function errorHandler(err) {
  if (err || (stats && stats.compilation.errors.length > 0)) {
    console.error(
      "[-] Something went wrong: " + err.message + "\n",
      err
    );

    // const error = err || stats.compilation.errors[0].error;
    // onError({ message: "<%= error.message %>" })(error);
    this.emit("end");
  }
}

/// PUG task
function buildPug() {
  return gulp.src(config.pug.entries)
    .pipe(plumber({ errorHandler }))
    .pipe(
      pug({
        // Your options in here.
      })
    )
    .pipe(beautify.html({ indent_size: 2 }))
    .pipe(gulp.dest(config.pug.outDir));
}

/// Sass task
function buildSass() {
  const sass = gulpSass(dartSass);

  return gulp.src(config.sass.entries)
    .pipe(plumber({ errorHandler: errorHandler }))
    .pipe(
      sass({
        outputStyle: "expanded",
        importer: packageImporter({
          extensions: [".scss", ".css"]
        })
      })
    )
    .pipe(postcss())
    .pipe(
      autoprefixer({
        cascade: false
      })
    )
    .pipe(uglyCss({ compatibility: 'ie8' }))
    .pipe(
      rename(function (path) {
        if (/^style_/.test(path.basename)) {
          path.basename = "style_latest";
        }
      })
    )
    .pipe(gulp.dest(config.sass.outDir))
    .pipe(browserSync.stream({ match: '**/*.css' }));
}

/// Typescript task
function buildTypescript() {
  return gulp.src(config.js.entries)
    .pipe(plumber({ errorHandler }))
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(config.js.outDir));
}

/// Clean builded files
function cleanGeneratedFiles() {
  console.log(
    "\n",
    "[!] Cleaning dist folder for fresh start.\n"
  );
  return gulp.src(config.BASE_DIST_DIR, { read: false, allowEmpty: true }).pipe(
    clean()
  );
}

/// Load Previews on Browser on dev
function livePreview(done) {
  browserSync.init({
    open: config.browserSync.open,
    port: config.browserSync.port,
    server: {
      baseDir: config.browserSync.dest, // output directory,
      index: "index.html"
    }
  });
  done();
}

/// Hot reload
function hotReload(done) {
  browserSync.reload();
  done();
  console.info("[+] Browser reload completed");
}

/// Watch for file changes and recompile
function watchFiles(done) {
  gulp.watch(
    config.watch.pug,
    gulp.series(buildPug, hotReload),
  );
  gulp.watch(
    config.watch.js,
    gulp.series(buildTypescript),
  );
  gulp.watch(
    config.watch.sass,
    gulp.series(buildSass),
  );

  if (config.watch.watchConfig) {
    gulp.watch(`./config.mjs`,
      gulp.series((cb) => flushModule(`./config.mjs`, cb), buildTypescript, buildPug)
    );

    gulp.watch(`./webpack.config.mjs`,
      gulp.series((cb) => flushModule(`./webpack.config.mjs`, cb), buildTypescript)
    );

    gulp.watch(`./tailwind.config.js`,
      gulp.series((cb) => flushModule(`./tailwind.config.js`, cb), buildSass)
    );
  }

  done();
}

/* Primary tasks */

gulp.task('default', (done) => {
  gulp.series(
    cleanGeneratedFiles,
    gulp.parallel(buildSass, buildTypescript),
    buildPug
  )(done)
});

gulp.task('serve', (done) => {
  gulp.series(
    cleanGeneratedFiles,
    gulp.parallel(buildSass, buildTypescript),
    buildPug,
    livePreview,
    watchFiles
  )(done)
});
