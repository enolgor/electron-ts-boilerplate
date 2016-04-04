'use strict'

const jetpack = require("fs-jetpack");
const childProcess = require("child_process");
const fs = require("fs");

const package_windows = function(resourcesDir, distDir, srcDir, manifest, cb){

  const installer_options = {};
  installer_options['APP_NAME'] = manifest.name;
  installer_options['COMP_NAME'] = manifest.buildProperties.company;
  installer_options['WEB_SITE'] = manifest.homepage;
  installer_options['VERSION'] = manifest.version+'.'+manifest.buildProperties.version;
  installer_options['COPYRIGHT'] = manifest.buildProperties.copyright;
  installer_options['DESCRIPTION'] = manifest.description;
  installer_options['MAIN_APP_EXE'] = manifest.name+'.exe';
  installer_options['APP_FOLDER_NAME'] = manifest.name;
  installer_options['LICENSE_TXT'] = srcDir.path(manifest.buildProperties.license_txt);
  installer_options['INSTALLER_ICON'] = resourcesDir.path('icon.ico');

  //console.log(installer_options['VERSION']); cb(); return;

  const paths = distDir.inspectTree('.').children.filter(child=>child.type==='dir').map(child=>distDir.cwd(child.name));
  console.log(JSON.stringify(paths));
  let installer_single = (i, paths, cb) => {
    if(i == paths.length){ cb(); return;}
    createInstaller(resourcesDir, installer_options, paths[i], paths[i].cwd('..'), ()=>installer_single(++i,paths,cb), cb);
  };

  installer_single(0, paths, cb);
};

function createInstaller(resourcesDir, installer_options, src, dest, resolve, reject){
  const installer_name = src.inspect('.').name+'-v'+installer_options['VERSION']+'-setup';

  installer_options['INSTALLER_NAME'] = dest.path(installer_name+'.exe');
  installer_options['INSTALL_FILES'] = src.path();
  installer_options['ARCH'] = installer_name.indexOf('64')>-1?'64':'32';

  let installScript = resourcesDir.read('installer.nsis');
  for(let pattern in installer_options) installScript = installScript.replace(new RegExp('{{'+pattern+'}}','g'), installer_options[pattern]);
  dest.write(installer_name+'.nsi', installScript);
  const nsis = childProcess.spawn('makensis', [dest.path(installer_name+'.nsi')], {stdio: 'inherit'});
  nsis.on('error', e=>reject('Failed building installer: '+installer_name+', reason: '+e));
  nsis.on('close', ()=>fs.unlink(dest.path(installer_name+'.nsi'), (e)=>{if(e) reject(e); else resolve();}));
}

module.exports = package_windows;
