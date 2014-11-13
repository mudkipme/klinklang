var gulp = require('gulp');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');

gulp.task('script', function(){
  var bundler = browserify('./public/javascripts/app.js', {basedir: __dirname});
  var stream = bundler.bundle();
  return stream
    .pipe(source('bundle.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./public/javascripts'));
});

gulp.task('sass', function () {
    gulp.src('./public/stylesheets/style.scss')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('default', ['script', 'sass']);