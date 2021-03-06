'use strict';

var gulp = require('gulp'),
    sh = require('execSync');

// Get version information to start with
var gitDescribe = sh.exec('git describe --dirty');
var matches = /v(\d+)\.(\d+)-(\d+)-g([0-9a-f]+)(-dirty)?/.exec(gitDescribe.stdout);

var version = {
    major: parseInt(matches[1]),
    minor: parseInt(matches[2]),
    patch: 0,
    build: parseInt(matches[3]),
    sha:   matches[4],
    dirty: matches[5] === '-dirty'
};

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

function handleError(err) {
    console.error(err.toString());
    this.emit('end');
}

gulp.task('mirror-bower', function () {
  return gulp.src('src/bower_components/**').pipe(gulp.dest('dist/bower_components'));
});

gulp.task('mirror-fonts', function () {
  return gulp.src('src/fonts/**').pipe(gulp.dest('dist/fonts'));
});

gulp.task('mirror-app', function () {
  return gulp.src('src/app/**').pipe(gulp.dest('dist/app'));
});

gulp.task('styles', ['wiredep'],  function () {
    return gulp.src('src/styles/main.less')
        .pipe($.less({
            paths: [
                'src/styles',
                'src/bower_components',
                'src/app',
                'src/components'
            ]
        }))
        .on('error', handleError)
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('src/styles'))
        .pipe(gulp.dest('.tmp'))
        .pipe($.size());
});

gulp.task('scripts', function () {
    return gulp.src('src/{app,components}/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.size());
});

gulp.task('partials', function () {
    return gulp.src('src/{app,components}/**/*.html')
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.ngHtml2js({
            moduleName: 'dealerportal.app'
        }))
        .pipe(gulp.dest('.tmp'))
        .pipe($.size());
});

gulp.task('html', ['styles', 'scripts', 'partials'], function () {
    var htmlFilter = $.filter('*.html');
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');
    var assets;

    var versionJs = 'return ' + JSON.stringify(version) + ';';

    return gulp.src('src/*.html')
        .pipe($.inject(gulp.src('.tmp/{app,components}/**/*.js'), {
            read: false,
            starttag: '<!-- inject:partials -->',
            addRootSlash: false,
            addPrefix: '../'
        }))
        .pipe(assets = $.useref.assets())
        .pipe($.rev())
        .pipe(jsFilter)
        .pipe($.replace(/.*\/\/ VERSION/, versionJs))
        .pipe($.ngAnnotate())
        .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.replace('src/bower_components/bootstrap/fonts','fonts'))
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(htmlFilter)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(htmlFilter.restore())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src('src/assets/images/**/*')
        .pipe($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('dist/assets/images'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return gulp.src($.mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size());
});

gulp.task('misc', function () {
    return gulp.src('src/**/*.ico')
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('clean', function (done) {
    $.del(['.tmp', 'dist', 'archive'], done);
});

gulp.task('build', ['html', 'images', 'mirror-fonts', 'misc', 'mirror-bower'], function() {
    var filename = 'dealerPortal-' + version.major + '.' + version.minor + '.' + version.patch + '.' + version.build + '-' + version.sha;
    if(version.dirty) { filename += '-dirty'; }
    filename += '.tar';

    return gulp.src('dist/**/*')
      .pipe($.tar(filename))
      .pipe($.gzip())
      .pipe(gulp.dest('archive'));
});
