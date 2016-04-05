#!/bin/sh

APP_NAME="{{APP_NAME}}"

chmod -R a+r /opt/$APP_NAME
chmod -R a+x /opt/$APP_NAME
chmod -R o-w /opt/$APP_NAME

ln -s /opt/$APP_NAME/$APP_NAME.png /usr/share/pixmaps/$APP_NAME.png
