'use strict'

const gulp = require('gulp');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const deb = require("gulp-deb");
const _ = require("lodash");

let data;
const patterns = {};
let resourcesDir;
function init(){
  patterns.data = data;
  resourcesDir = data.resourcesDir.cwd('./linux');
}

function getVar(dist, pattern){
  return _.get(patterns, pattern);
}

function processVars(dist, content){
  //for(let pattern in patterns) content = content.replace(new RegExp('{{'+pattern+'}}','g'), getVar(dist, pattern));
  //return content;
  return content;
}

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
  prop.section = data.manifest.buildProperties.section;
  prop.priority = "optional";
  prop.homepage = data.manifest.homepage;
  prop.short_description = data.manifest.description;
  prop.long_description = data.manifest.description;
  prop.scripts = {};
  if(resourcesDir.exists('./preinst.sh')) prop.scripts.preinst = processVars(dist, resourcesDir.read('./preinst.sh', 'utf-8'));
  if(resourcesDir.exists('./postinst.sh')) prop.scripts.postinst = processVars(dist, resourcesDir.read('./postinst.sh', 'utf-8'));
  if(resourcesDir.exists('./prerm.sh')) prop.scripts.prerm = processVars(dist, resourcesDir.read('./prerm.sh', 'utf-8'));
  if(resourcesDir.exists('./postrm.sh')) prop.scripts.postrm = processVars(dist, resourcesDir.read('./postrm.sh', 'utf-8'));
  //console.log(prop.scripts.postinst);
  //process.exit();
  return prop;
}

function createDeb(dist, resolve, reject){
  const installpath = data.manifest.buildProperties.path+"/"+data.manifest.name;
  const name = dist.inspect('.').name;
  const temp = dist.cwd('../'+name+'-tmp');
  dist.copy('.', temp.path('.'+installpath));

  gulp.src(resourcesDir.path('./include/root')+'/**/*').pipe(replace(/\{\{(.*)\}\}/g,(regex,match)=>getVar(dist, match))).pipe(rename(path=>{
    path.basename = processVars(dist, path.basename);
    return path;
  })).pipe(gulp.dest(temp.path('.'))).on('finish', ()=>
  gulp.src(resourcesDir.path('./include/appfolder')+'/**/*').pipe(replace(/\{\{(.*)\}\}/g,(regex,match)=>getVar(dist, match))).pipe(rename(path=>{
    path.basename = processVars(dist, path.basename);
    return path;
  })).pipe(gulp.dest(temp.path('.'+installpath))).on('finish', ()=> resolve()
    //gulp.src(temp.path('.')+'/**/*').pipe(deb(name+'-setup.deb', debProperties(dist))).pipe(gulp.dest(dist.path('..'))).on('finish', ()=>{/*temp.remove('.');*/ resolve();}).on('error', reject)
  ));
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
gulp.task('release-linux', cb=>runSequence('dist-linux', 'package-linux', cb));


module.exports = (_data) => {data = _data; init();};
