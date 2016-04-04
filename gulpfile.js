'use strict'
const argv = require('yargs').argv;
const gulp = require("gulp");
const childProcess = require("child_process");
const electron = require("electron-prebuilt");
const jetpack = require("fs-jetpack");
const packager = require("electron-packager");

const projectDir = jetpack;
const srcDir = jetpack.cwd('./src');
const buildDir = jetpack.dir('./build');
const resourcesDir = jetpack.cwd('./resources');
const distDir = jetpack.dir('./dist');
const manifest = srcDir.read('./package.json', 'json');

gulp.task('run', ()=>childProcess.spawn(electron, [srcDir.path()], {stdio: 'inherit'}));
gulp.task('clean', ()=>buildDir.dir('.', {empty: true}));
gulp.task('copy', ['clean'], ()=>projectDir.copy(srcDir.path(), buildDir.path(), {
  overwrite: true,
  matching: ['./node_modules/**/*', '*.html', '*.css', 'main.js', 'package.json']
}));
//gulp.task('build', ['copy'], ()=>gulp.src('./app/index.html').pipe(usemin({js: [uglify()]})).pipe(gulp.dest('build/')));
gulp.task('build', ['copy'], ()=>{});

/****************************/
/* ELECTRON PACKAGE & BUILD */
/****************************/

//ALL
manifest.buildProperties.version = manifest.version+'.'+argv.build&&parseInt(argv.build)?argv.build:0;

const electron_packager_options = {};
gulp.task('electron-packager-options', () => {
  electron_packager_options['dir'] = buildDir.path();
  electron_packager_options['app-version'] = manifest.version;
  electron_packager_options['asar'] = true;
  electron_packager_options['build-version'] = manifest.buildProperties.version;
  electron_packager_options['out'] = distDir.path();
  electron_packager_options['overwrite'] = true;
  electron_packager_options['arch'] = argv.arch?(parseInt(argv.arch)===32?'ia32':parseInt(argv.arch)===64?'x64':'all'):'all';
  electron_packager_options['prune'] = true;
  electron_packager_options['app-copyright'] = manifest.buildProperties.copyright;
});

function copy_license(paths){
  paths.forEach(path=>{
    let distpath = jetpack.cwd(path);
    distpath.rename('./LICENSE', 'LICENSE.electron');
    srcDir.copy(manifest.buildProperties.license_txt, distpath.path(manifest.buildProperties.license_txt));
  });
}

//WIN32

gulp.task('electron-packager-options-windows', ['electron-packager-options'], ()=>{
  electron_packager_options['out'] = distDir.path('./windows');
  electron_packager_options['platform'] = 'win32';
  electron_packager_options['icon'] = resourcesDir.path('./windows/icon.ico');
  electron_packager_options['version-string'] = {
    CompanyName: manifest.buildProperties.company,
    OriginalFilename: manifest.name,
    ProductName: manifest.name,
    InternalName: manifest.name
  };
});

gulp.task('dist-windows-clean', () =>  distDir.dir('./windows', {empty: true}));

gulp.task('dist-windows', ['build', 'electron-packager-options-windows', 'dist-windows-clean'], cb =>packager(electron_packager_options, (e,paths)=>{if(e) cb(e); else {copy_license(paths); cb();} }));

const windows_packager = require(resourcesDir.path('./windows/packager.js'));
gulp.task('release-windows', ['dist-windows'], cb=>windows_packager(resourcesDir.cwd('./windows'), distDir.cwd('./windows'), srcDir, manifest, cb));


//LINUX

gulp.task('electron-packager-options-linux', ['electron-packager-options'], ()=>{
  electron_packager_options['out'] = distDir.path('./linux');
  electron_packager_options['platform'] = 'linux';
});

gulp.task('dist-linux-clean', () => distDir.dir('./linux', {empty: true}));

gulp.task('dist-linux', ['build', 'electron-packager-options-linux', 'dist-linux-clean'], cb =>packager(electron_packager_options, (e,paths)=>{if(e) cb(e); else {copy_license(paths); cb();} }));

const linux_packager = require(resourcesDir.path('./linux/packager.js'));
gulp.task('release-linux', ['dist-linux'], cb=>linux_packager(resourcesDir.cwd('./linux'), distDir.cwd('./linux'), srcDir, manifest, cb));
