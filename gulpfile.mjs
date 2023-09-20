/*!
 * Gulp SMPL Layout Builder
 *
 * @version 8.3.3 (lite)
 * @author Artem Dordzhiev (Draft) | Cuberto
 * @type Module gulp
 * @license The MIT License (MIT)
 */

/* Get plugins */
import gulp from "gulp";
import pug from 'gulp-pug';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import * as del from 'del';
import ts from 'gulp-typescript';
import autoprefixer from 'gulp-autoprefixer';

/* Primary tasks */
gulp.task('default', (done) => {
  gulp.series('serve')(done)
});

gulp.task('serve', (done) => {
  gulp.series('clean', gulp.parallel('pug', 'sass', 'js'), 'browsersync', 'watch')(done)
});

/* Pug task */
gulp.task('pug', () => {
  return gulp.src(['./src/pug/**/*.pug', '!./src/pug/_includes/**/*'])
    .pipe(plumber())
    .pipe(pug({
      pretty: true,
      basedir: "./src/pug/"
    }))
    .pipe(gulp.dest('./tmp/')).on('end', () => {
      browserSync.reload();
    });
});

/* Sass task */
const sass = gulpSass(dartSass);
gulp.task('sass', () => {
  return gulp.src('./src/scss/main.scss')
    .pipe(sass({
      "includePaths": "node_modules"
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./tmp/assets/css/'))
    .pipe(browserSync.stream({ match: '**/*.css' }));
});

/* JS (webpack) task */
ts.createProject('tsconfig.json'); // Using tsconfig.json // https://www.npmjs.com/package/gulp-typescript#using-tsconfigjson
gulp.task('js', function () {
  return gulp.src('src/js/**/*.ts')
    .pipe(ts({
      noImplicitAny: true,
      outFile: 'bundle.js'
    }))
    .pipe(gulp.dest('./tmp/assets/js'));
});

/* Browsersync Server */
gulp.task('browsersync', (done) => {
  browserSync.init({
    server: ["./tmp", "./src/static"],
    notify: false,
    ui: false,
    online: false,
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: false
    }
  });
  done();
});

/* Watcher */
gulp.task('watch', () => {
  global.isWatching = true;

  gulp.watch("./src/scss/**/*.scss", gulp.series('sass'));
  gulp.watch("./src/pug/**/*.pug", gulp.series('pug'));
  gulp.watch("./src/js/**/*.*", gulp.series('js'));
  gulp.watch("./config.json", gulp.parallel('pug', 'js'));
});

/* FS tasks */
gulp.task('clean', async () => {
  return await del.deleteAsync(['./tmp/**/*'], { dot: true });
});
