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
data.appDir = data.srcDir.cwd('./app');
data.manifest = data.srcDir.read('./package.json', 'json');
data.manifest.buildProperties.version = data.manifest.version+'.'+(argv.build&&parseInt(argv.build)?argv.build:0);
data.arch = argv.arch?(parseInt(argv.arch)===32?'ia32':parseInt(argv.arch)===64?'x64':'all'):'all';
data.platform = argv.platform?(argv.platform==='windows'?'windows':argv.platform==='linux'?'linux':'all'):'all';

require('./tasks/build.js')(data);

require('./tasks/dist.js')(data);

require('./tasks/windows.packager.js')(data);

require('./tasks/linux.packager.js')(data);

gulp.task('dist', ['build'], cb=>{
  if(data.platform==='windows') runSequence('dist-windows', cb);
  else if(data.platform==='linux') runSequence('dist-linux', cb);
  else runSequence('dist-windows', 'dist-linux', cb);
});

gulp.task('package', cb=>{
  if(data.platform==='windows') runSequence('package-windows', cb);
  else if(data.platform==='linux') runSequence('package-linux', cb);
  else runSequence('package-windows', 'package-linux', cb);
});

gulp.task('release', cb=>{ runSequence('dist', 'package', cb);

  /*if(data.platform==='windows') runSequence('release-windows');
  else if(data.platform==='linux') runSequence('release-linux');
  else runSequence('release-windows', 'release-linux');*/
});
