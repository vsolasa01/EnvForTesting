'use strict';
var srcDir = 'Proposal/';
var buildDir = 'build/';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');

gulp.task('default', ['uglify-js', 'minify-css', 'minify-html', 'copy-images'], function () {
    
});

gulp.task('uglify-js', function () {
	var processDir = 'scripts/'
	gulp.src(srcDir + processDir + '*.js')
    .pipe(uglify())
    .pipe(gulp.dest(buildDir + processDir))
});

gulp.task('minify-css', function() {
	var processDir = 'css/'
	gulp.src(srcDir + processDir + '*.css')
    .pipe(minifyCSS({keepBreaks:true}))	
    .pipe(gulp.dest(buildDir + processDir))
});

gulp.task('minify-html', function() {
  var opts = {
    conditionals: true,
    spare:true
  };
  return gulp.src(srcDir + '*.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest(buildDir));
});

gulp.task('copy-images', function(){
	return gulp.src(srcDir + 'images/*.*')
    .pipe(gulp.dest(buildDir + 'images'));
});


