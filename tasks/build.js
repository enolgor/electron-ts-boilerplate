'use strict'

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const usemin = require('gulp-usemin');
const childProcess = require("child_process");
const electron = require("electron-prebuilt");
const livereload = require("gulp-livereload");
const runSequence = require("run-sequence");

let data;

gulp.task('run', ()=>{const proc = childProcess.spawn(electron, [data.srcDir.path()], {stdio: 'inherit'}); proc.on('close', process.exit); });
gulp.task('watch', ()=>{livereload.listen(); gulp.watch(data.appDir.path()+'/**/*', (change)=>{ gulp.src(change.path).pipe(livereload()); }); });
gulp.task('serve', ()=>runSequence('watch', 'run'));

gulp.task('clean', ()=>data.buildDir.dir('.', {empty: true}));
gulp.task('copy', ['clean'], ()=>data.projectDir.copy(data.srcDir.path(), data.buildDir.path(), {
  overwrite: true,
  matching: ['./node_modules/**/*', data.appDir.inspect('.').name+'/**/*', data.manifest.main, 'package.json']
}));
//gulp.task('build', ['copy'], ()=>gulp.src('./app/index.html').pipe(usemin({js: [uglify()]})).pipe(gulp.dest('build/')));
gulp.task('build', ['copy'], ()=>{
  let buildApp = data.buildDir.path(data.appDir.inspect('.').name);
  gulp.src(buildApp+'/*.html').pipe(usemin({js: [uglify()]})).pipe(gulp.dest(buildApp+'/'))
});

module.exports = (_data)=>{ data = _data; }
