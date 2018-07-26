'use strict';

const gulp = require('gulp');
const electron = require('electron');
const spawn = require('child_process').spawn;

require('./tasks/build_app');
require('./tasks/build_tests');

gulp.task('start', [ 'build', 'watch' ], () => {
    spawn(electron, [ '.' ], { stdio: 'inherit' })
        .on('close', () => process.exit());
});
