'use strict';

var gulp = require('gulp');

gulp.task('watch', function() {
    gulp.watch('src/styles/**/*.less', ['styles']);
});