import { version } from './modules/util';

document.getElementById('version-node').innerHTML = version('node');
document.getElementById('version-chromium').innerHTML = version('chrome');
document.getElementById('version-electron').innerHTML = version('electron');