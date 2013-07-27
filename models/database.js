var sqlite3 = require('sqlite3').verbose();
var base = new sqlite3.Database(__dirname + '/../database/base.sqlite3');

exports.base = base;