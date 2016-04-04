'use strict'

const gulp = require('gulp');
const runSequence = require('run-sequence');

let data;

gulp.task('package-linux', cb=>{cb();});
gulp.task('release-linux', cb=>runSequence('dist-linux', 'package-linux', cb));

module.exports = (_data) => {data = _data;}; 
