const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const uglifycss = require('gulp-uglifycss');
const concat = require('gulp-concat');
const runSequence = require('run-sequence');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const gls = require('gulp-live-server');

gulp.task('babelify', () => {
  return browserify('client/js/main.js')
    .transform(babelify, {presets: ['es2015']})
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('public'));
});

gulp.task('uglify:js', () => {
  return gulp.src(['public/app.js'])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('public'))
});

gulp.task('seq:js', () => {
  runSequence('babelify', 'uglify:js')
});

gulp.task('vendors:ace', () => {
  return gulp.src('node_modules/ace-builds/src-min-noconflict/**/*')
    .pipe(gulp.dest('public/ace/'));
});

gulp.task('sass', () => {
  return gulp.src('client/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('public'));
});

gulp.task('uglify:css', () => {
  return gulp.src('public/main.css')
    .pipe(uglifycss())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('public'));
});

gulp.task('seq:css', () => {
  runSequence('sass', 'uglify:css')
});

gulp.task('build', () => {
  runSequence(['seq:css', 'seq:js', 'vendors:ace']);
});

gulp.task('dev', ['build'], () => {
  const server = gls.new('server.js');

  server.start();

  gulp.watch('client/sass/**/*.scss', ['seq:css']);
  gulp.watch('client/js/**/*.js', ['seq:js']);

  gulp.watch(['client/js/**/*.js', 'client/sass/**/*.scss'], function(file) {
    server.notify.apply(server, [file]);
  });
  gulp.watch('server.js', server.start.bind(server));
});
