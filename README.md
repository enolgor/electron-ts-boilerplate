# Electron-Boilerplate
Electron Boilerplate with gulp tasks to run, serve with livereload, build and make windows/linux distributions, binary installers for windows (with makensis) and deb installers.

## How to use this boilerplate

- Install git, node & npm (comes with node) for windows or linux.
- Install nsis software (only on windows) if you plan to build windows binary installers. The nsis software folder should be on the windows PATH.
- Clone this repository: `git clone https://github.com/elterx/electron-boilerplate`
- CD to directory and install dependencies `npm install`
- If on linux install gulp globally (`npm install -g gulp`), on windows gulp.bat does the trick.
- Your electron app will be in the **src** folder, where your application **package.json**, **LICENSE** file, **main script** of application and under the **app** folder the rest of html/javascript/css files.
- Also, any node dependency of your application should be installed in the **src** folder and saved in the **src/package.json** file. This folder is the place to install bower.
- All metadata to build windows/linux binary distributions and installers is in the **src/package.json** file, every field in that file should be completed in order to have a correct build.
- The only metadata that should be placed outside is your application icon, that should be
place in the **resources** folder in two different formats: *icon.ico* for the windows icon and *icon.png* for the linux icon.

## Gulp tasks

- `gulp run` will run your application.
- `gulp serve` will serve your application and reload changes dynamically (but livereload.js should be inserted in your html files, as in the example).
- `gulp build` will build your application and place it in the build folder.
- `gulp dist [--platform windows|linux|all] [--arch 32|64|all] [--build 123]` will build (build number 123) your application and use the *electron-packager* to generate the binary distributions under the **dist** folder.
- `gulp package --platform windows|linux|all --build 123` will generate binary installers (windows installers and currently only .deb packages) of the last distribution generated under the **dist** folder. Those installers will be placed on the same folder.
- `gulp release --platform windows|linux|all --arch 32|64|all --build 123` is the same as executing `gulp dist` and `gulp package` in sequence.

## Advanced usage

There are four files under the tasks folder:
- **build.js** contains the run, build and serve taks. Here is where you can manipulate the build process (using usemin, uglify, etc...).
- **dist.js** contains the tasks related to the creation of binary distributions of the electron application, using the *electron-packager* module.
- **windows.packager.js** is the one that controls the windows installer creation task, using the [*makensis* tool of nsis](https://sourceforge.net/projects/nsis/files/latest/download?source=typ_redirect) and **resources/installer.nsis** as template for the installer creation.
- The last file, **linux.packager.js** uses the *gulp-deb* module to create the linux deb packages.
