const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
const gutil = require('gulp-util');
const tsify = require('tsify');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const _electron = require('electron-connect').server;


module.exports = (data)=>{
    const src = data.appDir_src;
    const dist = data.appDir_dist;
    const clean = () => dist.dir('.', {empty: true});
    const copy = () => gulp.src(['**/*.*','!**/*.ts'], {cwd: src.path('.')}).pipe(gulp.dest(dist.path('.')));

    const watchedBrowserify = watchify(browserify({
        basedir: src.path('.'),
        debug: true,
        entries: ['./main.ts'],
        cache: {},
        packageCache: {}
    }).plugin(tsify));

    const bundle = () => watchedBrowserify
    .transform('babelify', {
        presets: ['es2015'],
        extensions: ['.ts']
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist.path('.')));

    gulp.task('serve', ()=>{
        const electron = _electron.create({path: data.srcDir.path('.')});
        electron.start();
        copy();
        bundle();
        gulp.watch(data.srcDir.path('main.js'), electron.restart);
        gulp.watch([src.path('/**/*.*'), '!'+src.path('/**/*.ts')], ()=>{clean(); copy(); bundle(); electron.reload();});
        watchedBrowserify.on('update', ()=>{bundle(); electron.reload();});
        watchedBrowserify.on('log', gutil.log);
    });
}


