'use strict';
module.exports = function (config) {
    config.set({
        basePath: '..', //!\\ Ignored through gulp-karma //!\\
        files: [ //!\\ Ignored through gulp-karma //!\\
            'src/bower_components/angular/angular.js',
            'src/bower_components/jquery/dist/jquery.js',
            'src/bower_components/spin.js/spin.js',
            'src/bower_components/lodash/dist/lodash.js',

            'src/bower_components/moment/moment.js',
            'src/bower_components/angular-mocks/angular-mocks.js',

            'src/bower_components/angular-resource/angular-resource.js',
            'src/bower_components/angular-sanitize/angular-sanitize.js',
            'src/bower_components/angular-shims-placeholder/dist/angular-shims-placeholder.js',
            'src/bower_components/angular-ui-router/release/angular-ui-router.js',
            'src/bower_components/angular-ui-utils/ui-utils.js',
            'src/bower_components/angular-local-storage/dist/angular-local-storage.js',
            'src/bower_components/angular-bootstrap/ui-bootstrap.js',
            'src/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'src/bower_components/angular-spinner/angular-spinner.js',
            'src/bower_components/angular-google-maps/dist/angular-google-maps.js',

            'src/app/{,**/}*.js',
            'test/unit{,**/}*.js'
        ],
        autoWatch: true,
        singleRun: false,
        frameworks: ['jasmine'],
        browsers: ['Chrome'],
        plugins: [
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-coverage'
        ],
        preprocessors: {
          'src/app/{,**/}*.js': ['coverage']
        },

        reporters: ['coverage'],

        coverageReporter: {
            dir: 'coverage/',
            subdir: '.',
            reporters: [
                {type: 'html', dir: 'coverage/'},
                {type: 'cobertura'}
            ]
        }
    });
};
