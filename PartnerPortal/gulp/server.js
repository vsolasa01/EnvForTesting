'use strict';

var gulp = require('gulp');

var browserSync = require('browser-sync');

var middleware = require('./proxy');

function browserSyncInit(baseDir, files, browser) {
    browser = browser === undefined ? 'default' : browser;

    browserSync.instance = browserSync.init(files, {
        startPath: '/?stub=default#/',
        server: {
            baseDir: baseDir,
            middleware: middleware
        },
        browser: browser
    });

}

gulp.task('serve', ['watch'], function () {
    browserSyncInit([
        'src',
        '.tmp'
    ], [
        '.tmp/{styles}/**/*.css',
        '.tmp/{styles}/**/*.less',
        'src/{styles}/**/*.css',
        'src/{styles}/**/*.less',
        'src/assets/images/**/*',
        'src/*.html',
        'src/fonts/**/*',
        'src/{app}/**/*.html',
        'src/{app}/**/*.js'
    ]);
});

gulp.task('serve:dist', ['build'], function () {
    browserSyncInit('dist');
});

gulp.task('serve:e2e', function () {
    browserSyncInit(['src', '.tmp'], null, []);
});

gulp.task('serve:e2e-dist', ['watch'], function () {
    browserSyncInit('dist', null, []);
});
