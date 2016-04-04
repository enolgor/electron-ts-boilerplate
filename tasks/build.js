'use strict'

const gulp = require('gulp');
const childProcess = require("child_process");
const electron = require("electron-prebuilt");

let data;

gulp.task('run', ()=>childProcess.spawn(electron, [data.srcDir.path()], {stdio: 'inherit'}));
gulp.task('clean', ()=>data.buildDir.dir('.', {empty: true}));
gulp.task('copy', ['clean'], ()=>data.projectDir.copy(data.srcDir.path(), data.buildDir.path(), {
  overwrite: true,
  matching: ['./node_modules/**/*', '*.html', '*.css', 'main.js', 'package.json']
}));
//gulp.task('build', ['copy'], ()=>gulp.src('./app/index.html').pipe(usemin({js: [uglify()]})).pipe(gulp.dest('build/')));
gulp.task('build', ['copy'], ()=>{});

module.exports = (_data)=>{ data = _data; }
