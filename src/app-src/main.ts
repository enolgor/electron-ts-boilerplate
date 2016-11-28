import { version } from './modules/util';
import { Vue } from './modules/window';

var app = new Vue({
  el: '#info',
  data: {
    node_version: version('node'),
    chrome_version: version('chrome'),
    electron_version: version('electron')
  }
});