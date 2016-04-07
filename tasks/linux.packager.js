'use strict'

const gulp = require('gulp');
const deb = require("gulp-deb");
const tmp = require("tmp");
const jetpack = require("fs-jetpack");

let data;

function debProperties(dist){
  const prop = {};
  prop.name = data.manifest.name;
  prop.version = data.manifest.buildProperties.version;
  prop.maintainer = {};
  prop.maintainer.name = data.manifest.author.name;
  prop.maintainer.email = data.manifest.author.email;
  prop.architecture = dist.inspect('.').name.indexOf('64')>-1?'amd64':'i386';
  prop.installedSize = (dist.inspectTree('.').size/1024);
  prop.preDepends = ['dpkg (>= 1.15.6)'];
  prop.depends = null;
  prop.recommends = null;
  prop.suggests = null;
  prop.enhances = null;
  prop.section = data.manifest.buildProperties.linux.section;
  prop.priority = "optional";
  prop.homepage = data.manifest.homepage;
  prop.short_description = data.manifest.description;
  prop.long_description = data.manifest.description;
  prop.scripts = {};
  const installpath = data.manifest.buildProperties.linux.installpath+"/"+data.manifest.buildProperties.short_name;
  prop.scripts.postinst = `#!/bin/sh\nchmod -R a+r ${installpath}\nchmod -R a+x ${installpath}\nchmod -R o-w ${installpath}\nln -s ${installpath}/icon.png /usr/share/pixmaps/${data.manifest.buildProperties.short_name}.png`;
  prop.scripts.prerm = `#!/bin/sh\nrm /usr/share/pixmaps/${data.manifest.buildProperties.short_name}.png`;
  return prop;
}

function createDeb(dist, resolve, reject){
  const prop = debProperties(dist);
  const installpath = data.manifest.buildProperties.linux.installpath+"/"+data.manifest.buildProperties.short_name;
  const name = dist.inspect('.').name;
  const temp = jetpack.cwd(tmp.dirSync().name);
  dist.copy('.', temp.path('.'+installpath));
  data.resourcesDir.copy('./icon.png', temp.path('.'+installpath+'/icon.png'));
  temp.write(`./usr/share/applications/${data.manifest.buildProperties.short_name}.desktop`, `[Desktop Entry]\nName=${prop.name}\nExec=${installpath}/${data.manifest.buildProperties.short_name}\nIcon=${data.manifest.buildProperties.short_name}\nType=Application\nCategories=${data.manifest.buildProperties.linux.categories}`);
  gulp.src(temp.path('.')+'/**/*').pipe(deb(name+'-v'+data.manifest.buildProperties.version+'-setup.deb', prop)).pipe(gulp.dest(dist.path('..'))).on('finish', ()=>{temp.remove('.'); resolve();}).on('error', reject)
}

gulp.task('package-linux', cb=>{
  let distDir = data.distDir.cwd('./linux');
  const dists = distDir.inspectTree('.').children.filter(child=>child.type==='dir').map(child=>distDir.cwd(child.name));
  let deb_single = (i, dists, resolve, reject) => {
    if(i == dists.length){ resolve(); return;}
    createDeb(dists[i], ()=>deb_single(++i,dists,resolve,reject), reject);
  };
  deb_single(0, dists, ()=>cb(), ()=>cb('Error creating deb package'));
});
//gulp.task('release-linux', cb=>runSequence('dist-linux', 'package-linux', cb));

module.exports = (_data) => {data = _data;};
