#!/bin/sh
r.js -o public/build/app.build.js
sass --style compressed public/stylesheets/style.scss dist/stylesheets/style.css
