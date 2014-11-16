var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');

'use strict';

gulp.task('script', function() {
  var bundler = browserify('./public/javascripts/app.js', {basedir: __dirname});

  var bundle = function() {
    var stream = bundler.bundle();
    stream = stream.pipe(source('bundle.js'));
    if (!global.isWatching) {
      stream = stream.pipe(streamify(uglify()));
    }
    return stream.pipe(gulp.dest('./public/javascripts'));
  };
  
  if (global.isWatching) {
    bundler = watchify(bundler);
    bundler.on('update', bundle);
  }

  return bundle();
});

gulp.task('sass', function() {
  gulp.src('./public/stylesheets/style.scss')
  .pipe(sass({outputStyle: global.isWatching ? 'nested' : 'compressed'}))
  .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('default', ['script', 'sass']);
gulp.task('watch', ['set-watch-flag', 'script', 'sass'], function() {
  gulp.watch('./public/**/*.scss', ['sass']);
});

gulp.task('set-watch-flag', function() {
  global.isWatching = true;
});