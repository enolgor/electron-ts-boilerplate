'use strict'

const gulp = require('gulp');
const watch = require('gulp-watch');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
const gutil = require('gulp-util');
const tsify = require('tsify');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const _electron = require('electron-connect').server;
const runSequence = require('run-sequence');
const childProcess = require("child_process");
const electron = require('electron');


module.exports = (data)=>{
    const static_files = ['**/*','!**/*.ts'];
    const src = data.appDir_src;
    const app = data.appDir;

    const watchedBrowserify = watchify(browserify({
        basedir: src.path('.'),
        debug: true,
        entries: ['./main.ts'],
        cache: {},
        packageCache: {}
    }).plugin(tsify).transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
    }));

    gulp.task('clean', ()=>{
        app.dir('.', {empty: true});
    });

    gulp.task('copy', ['clean'], ()=>gulp.src(static_files, {cwd: src.path('.')}).pipe(gulp.dest(app.path('.'))));

    gulp.task('bundle', ['copy'], ()=>
        watchedBrowserify.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(app.path('.'))));
 
    gulp.task('serve', ['bundle'], ()=>{     

        const electron_server = _electron.create({path: data.srcDir.path('.'), stopOnClose: true});

        electron_server.start([data.srcDir.path('.'), 'dev'], (eps)=>{if (eps === 'stopped') process.exit();});

        gulp.task('electron-update', ['bundle'], cb=>{
            electron_server.reload();
            cb();
        });

        watch(static_files, {cwd: src.path('.')}, ()=>gulp.start('electron-update')).on('error', ()=>{});;
        gulp.watch(data.srcDir.path('*'), electron_server.restartgulp);

        watchedBrowserify.on('update', ()=>gulp.start('electron-update'));
        watchedBrowserify.on('log', gutil.log);
    });

    gulp.task('build', ['bundle'], ()=>{
        data.buildDir.dir('.', {empty: true});
        data.projectDir.copy(data.srcDir.path('.'), data.buildDir.path('.'), {
            overwrite: true,
            matching: ['./node_modules/**/*', app.inspect('.').name+'/**/*', data.manifest.main, 'package.json']
        });
    });    

    gulp.task('run', ['build'], ()=>{
        childProcess.spawn(electron, [data.buildDir.path('.')], {stdio: 'inherit'}).on('close', process.exit);
    });
}


