'use strict'

//const gulp = require('gulp');
//const uglify = require('gulp-uglify');
//const usemin = require('gulp-usemin');
//const childProcess = require("child_process");
//const electron = require("electron");
//const runSequence = require("run-sequence");


//let data;

//gulp.task('run', ()=>{const proc = childProcess.spawn(electron, [data.srcDir.path()], {stdio: 'inherit'}); proc.on('close', process.exit); });
//gulp.task('run', ()=>{
//  const electron = require('electron-connect').server.create({path: data.srcDir.path()});

  //const proc = childProcess.spawn(electron, [data.srcDir.path()], {stdio: 'inherit'}); proc.on('close', process.exit);
//  electron.start();
//  gulp.watch(data.srcDir.path()+'/main.js', electron.restart);
//  gulp.watch(data.appDir.path()+'/**/*', electron.reload);
//});
//gulp.task('watch', ()=>{livereload.listen(); gulp.watch(data.appDir.path()+'/**/*', (change)=>{ gulp.src(change.path).pipe(livereload()); }); });
//gulp.task('serve', ()=>runSequence('watch', 'run'));

//gulp.task('clean', ()=>data.buildDir.dir('.', {empty: true}));
//gulp.task('copy', ['clean'], ()=>data.projectDir.copy(data.srcDir.path(), data.buildDir.path(), {
//  overwrite: true,
//  matching: ['./node_modules/**/*', data.appDir.inspect('.').name+'/**/*', data.manifest.main, 'package.json']
//}));

//gulp.task('build', ['copy'], ()=>{
//  let buildApp = data.buildDir.path(data.appDir.inspect('.').name);
//  gulp.src(buildApp+'/*.html').pipe(usemin({js: [uglify()]})).pipe(gulp.dest(buildApp+'/'))
//});

//module.exports = (_data)=>{ data = _data; }


const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
const gutil = require('gulp-util');
const tsify = require('tsify');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');

let data;

const _electron = require('electron-connect').server;

const copy = () =>{
  gulp.src(data.appDir_src.path('./*.html')).pipe(gulp.dest(data.appDir_dist.path('.')));
};

gulp.task('serve', ()=>{
  const watchedBrowserify = watchify(browserify({
      basedir: data.appDir_src.path('.'),
      debug: true,
      entries: ['./main.ts'],
      cache: {},
      packageCache: {}
  }).plugin(tsify));

  const bundle = () => watchedBrowserify
    .transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(data.appDir_dist.path('.')));

  copy();
  bundle();

  const electron = _electron.create({path: data.srcDir.path('.')});
  electron.start();
  watchedBrowserify.on('update', ()=>{console.log('hola'); copy(); bundle(); electron.reload();});
  watchedBrowserify.on('log', gutil.log);
});




module.exports = (_data)=>{ data = _data; };
