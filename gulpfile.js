'use strict'
const argv = require('yargs').argv;
const gulp = require("gulp");
const runSequence = require('run-sequence');
const jetpack = require("fs-jetpack");

const data = {};

data.projectDir = jetpack;
data.srcDir = jetpack.cwd('./src');
data.buildDir = jetpack.dir('./build');
data.resourcesDir = jetpack.cwd('./resources');
data.distDir = jetpack.dir('./dist');
data.manifest = data.srcDir.read('./package.json', 'json');
data.manifest.buildProperties.version = data.manifest.version+'.'+(argv.build&&parseInt(argv.build)?argv.build:0)
data.arch = argv.arch?(parseInt(argv.arch)===32?'ia32':parseInt(argv.arch)===64?'x64':'all'):'all';
data.platform = argv.platform?(argv.platform==='windows'?'windows':argv.platform==='linux'?'linux':'all'):'all';

require('./tasks/build.js')(data);

require('./tasks/dist.js')(data);

require('./tasks/windows.packager.js')(data);

require('./tasks/linux.packager.js')(data);

gulp.task('dist', cb=>{
  if(data.platform==='windows') runSequence('build', 'dist-windows');
  else if(data.platform==='linux') runSequence('build', 'dist-linux');
  else runSequence('build', 'dist-windows', 'dist-linux');
});

gulp.task('package', cb=>{
  if(data.platform==='windows') runSequence('package-windows');
  else if(data.platform==='linux') runSequence('package-linux');
  else runSequence('package-windows', 'package-linux');
});

gulp.task('release', cb=>{
  if(data.platform==='windows') runSequence('release-windows');
  else if(data.platform==='linux') runSequence('release-linux');
  else runSequence('release-windows', 'release-linux');
});
