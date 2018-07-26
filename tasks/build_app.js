'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const plumber = require('gulp-plumber');
const jetpack = require('fs-jetpack');
const bundle = require('./bundle');
const utils = require('./utils');

const projectDir = jetpack;
const srcDir = jetpack.cwd('./src');
const configDir = jetpack.cwd('./config');
const destDir = jetpack.cwd('./app');

gulp.task('bundle', () => Promise.all([
    bundle(srcDir.path('background.js'), destDir.path('background.js')),
    bundle(srcDir.path('app.js'), destDir.path('app.js')),
    bundle(srcDir.path('i18n/index.js'), destDir.path('i18n/index.js'))
]));

gulp.task('copy-assets', () => Promise.all([
    gulp.src(srcDir.path('public')+'/**/*').pipe(gulp.dest(destDir.path('public'))),
    gulp.src(srcDir.path('i18n/lang')+'/**/*').pipe(gulp.dest(destDir.path('i18n/lang')))
]));

gulp.task('less', () =>
    gulp.src(srcDir.path('stylesheets/main.less'))
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest(destDir.path('stylesheets')))
);

gulp.task('environment', () => projectDir.copy(configDir.path(`env_${ utils.getEnvName() }.json`),
    destDir.path('env.json'), { overwrite: true }));

gulp.task('watch', () => {
    const beepOnError = done => {
        return err => {
            if (err) {
                utils.beepSound();
            }

            done(err);
        };
    };

    watch(srcDir.path('.') + '/**/*.js', batch((events, done) => gulp.start('bundle', beepOnError(done))));
    watch(srcDir.path('.') + '/{public,i18n}/**/*', batch((events, done) => gulp.start('copy-assets', beepOnError(done))));
    watch(srcDir.path('.') + '/**/*.less', batch((events, done) => gulp.start('less', beepOnError(done))));
    watch(configDir.path('.') + '/**/*', batch((events, done) => gulp.start('environment', beepOnError(done))));
});

gulp.task('build', [ 'bundle', 'copy-assets', 'less', 'environment' ]);
