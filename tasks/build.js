'use strict'

const gulp = require('gulp');
const watch = require('gulp-watch');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const gutil = require('gulp-util');
const tsify = require('tsify');
const uglify = require('gulp-uglify');
const usemin = require('gulp-usemin');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const _electron = require('electron-connect').server;
const runSequence = require('run-sequence');
const childProcess = require("child_process");
const electron = require('electron');


module.exports = (data)=>{
    const static_files = ['**/*','!**/*.html','!**/*.ts','!tsconfig.json'];
    //const watch_files = ['**/*', '!**/*.ts', ]

    const src = data.appDir_src;
    const app = data.appDir;

    const b = browserify({
        basedir: src.path('.'),
        debug: true,
        entries: ['./main.ts'],
        cache: {},
        packageCache: {}
    }).plugin(tsify, {project: src.path('tsconfig.json')}).transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
    });

    const clean = () => app.dir('.', {empty: true});

    const copy = () => gulp.src(static_files, {cwd: src.path('.')}).pipe(gulp.dest(app.path('.')));

    const bundle = () => b.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(app.path('.')));

    const minify = () => gulp.src('**/*.html', {cwd: src.path('.')})
        .pipe(usemin({
            js: [uglify()]
        }))
        .pipe(gulp.dest(app.path('.')));

    gulp.task('clean', clean);

    gulp.task('copy', ['clean'], copy);

    gulp.task('bundle', ['copy'],  bundle);

    gulp.task('minify', ['bundle'], minify);
 
    gulp.task('serve', ['minify'], ()=>{     

        const electron_server = _electron.create({path: data.srcDir.path('.'), stopOnClose: true});

        electron_server.start([data.srcDir.path('.'), 'dev'], (eps)=>{if (eps === 'stopped') process.exit();});

        gulp.task('electron-update', ['minify'], cb=>{
            electron_server.reload();
            cb();
        });
        
        watch('**/*', {cwd: src.path('.')}, () => runSequence('electron-update'));
        gulp.watch(data.srcDir.path('*'), electron_server.restart);

    });

    gulp.task('build', ['minify'], ()=>{
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


