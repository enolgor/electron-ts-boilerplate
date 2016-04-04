'use strict'

const gulp = require('gulp');
const jetpack = require('fs-jetpack');
const packager = require("electron-packager");

let data;

function init(){
  data.electron_packager_options = {};
  data.electron_packager_options['dir'] = data.buildDir.path();
  data.electron_packager_options['app-version'] = data.manifest.version;
  data.electron_packager_options['asar'] = true;
  data.electron_packager_options['build-version'] = data.manifest.buildProperties.version;
  data.electron_packager_options['out'] = data.distDir.path();
  data.electron_packager_options['overwrite'] = true;
  data.electron_packager_options['arch'] = data.arch;
  data.electron_packager_options['prune'] = true;
  data.electron_packager_options['app-copyright'] = data.manifest.buildProperties.copyright;
}

function copy_license(paths){
  paths.forEach(path=>{
    let distpath = jetpack.cwd(path);
    distpath.rename('./LICENSE', 'LICENSE.electron');
    data.srcDir.copy(data.manifest.buildProperties.license_txt, distpath.path(data.manifest.buildProperties.license_txt));
  });
};

//WINDOWS
gulp.task('dist-windows-clean', () =>  data.distDir.dir('./windows', {empty: true}));
gulp.task('dist-windows', ['dist-windows-clean'], cb =>{
  data.electron_packager_options['out'] = data.distDir.path('./windows');
  data.electron_packager_options['platform'] = 'win32';
  data.electron_packager_options['icon'] = data.resourcesDir.path('./windows/icon.ico');
  data.electron_packager_options['version-string'] = {
    CompanyName: data.manifest.buildProperties.company,
    OriginalFilename: data.manifest.name,
    ProductName: data.manifest.name,
    InternalName: data.manifest.name
  };
  packager(data.electron_packager_options, (e,paths)=>{if(e) cb(e); else {copy_license(paths); cb();} });
});

//LINUX
gulp.task('dist-linux-clean', () => data.distDir.dir('./linux', {empty: true}));
gulp.task('dist-linux', ['dist-linux-clean'], cb =>{
  data.electron_packager_options['out'] = data.distDir.path('./linux');
  data.electron_packager_options['platform'] = 'linux';
  packager(data.electron_packager_options, (e,paths)=>{if(e) cb(e); else {copy_license(paths); cb();} });
});

module.exports = (_data)=>{ data = _data; init(); }
