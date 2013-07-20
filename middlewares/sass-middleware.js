/**
 * Modified from: https://github.com/blackbeam/sass-middleware
 * License: http://opensource.org/licenses/BSD-2-Clause
 */

(function () {
    "use strict";
    var fs = require('fs'),
        url = require('url'),
        spawn = require('child_process').spawn;

    var updating = {};

    module.exports = function (options) {
        options = options || {};
        options.bin = options.bin || 'sass';
        options.src = options.src || 'public';
        options.dest = options.dest || options.src;
        options.quiet = options.quiet || false;
        options.cache_location = options.cache_location || false;
        options.suffix = options.suffix || '.scss';

        var log = function (key, val, type) {
            var c;
            if (!options.quiet || type === 'error') {
                switch (type) {
                    case 'log':
                    case 'info':
                        c = '36m';
                        break;
                    case 'error':
                        c = '31m';
                        break;
                    case 'warn':
                        c = '33m';
                        break;
                    default:
                        type = 'log';
                }

                console[type]('  \x1b[90m%s :\x1b[0m \x1b['+c+'%s\x1b[0m', key, val);
            }
        };

        var sassError = function (str) {
            log("Sass", str, 'error');
        };
        var sassLog = function (str) {
            log("Sass", str, 'log');
        };


        var update = function (src, dest, cb) {
            var cmd = options.bin;
            var args = [];
            var opts = {
                cwd: process.cwd()
            };

            if (options.quiet) args.push('-q');
            if (options.cache_location) {
                args.push('--cache_location');
                args.push(options.cache_location);
            }
            if (options.style) {
                args.push('--style');
                args.push(options.style);    
            }
            args.push('--update');
            args.push(src + ':' + dest);

            var sass = spawn(cmd, args, opts);
            sassLog('Spawning `' + cmd + ' ' + args.join(' ') + '` in ' + opts.cwd);
            sass.stdout.on('data', function (data) {
                console.log('get stdout');
                data.toString().split('\n').forEach(sassLog);
            });
            sass.stderr.on('data', function (data) {
                console.log('get stderr');
                data.toString().split('\n').forEach(sassError);
            });
            sass.on('error', function (error) {
                cb(error);
            });
            sass.on('exit', function (code, signal) {
                if (code !== 0) {
                    sassError('exit with code '+code+' by signal '+signal+' (src: '+src+')');
                } else {
                    sassLog('exit with code '+code+' by signal '+signal);
                }
                cb();
            });
        };

        return function mw(req, res, next) {

            if ('GET' != req.method.toUpperCase() &&
                'HEAD' != req.method.toUpperCase())
            {
                return next();
            }

            var pathname = url.parse(req.url).pathname;

            if (! (/\.css$/).test(pathname)) {
                return next();
            }

            if (!(pathname in updating)) {
                var src = options.src + '/' + pathname.replace('.css', options.suffix);
                var dst = options.dest + '/' + pathname;

                fs.stat(src, function(err, scssStats){
                    if (err) return next();

                    fs.stat(dst, function(err, cssStats){
                        if ((err && 'ENOENT' == err.code) || scssStats.mtime > cssStats.mtime) {
                            updating[pathname] = true;

                            update(src, dst, function (error) {
                                if (error) {
                                    sassError(error.message);
                                }
                                next();
                                delete updating[pathname];
                            });
                        } else {
                            next();
                        }
                    });
                });
            } else {
                return setTimeout(mw.bind(this, req, res, next), 200);
            }
        };
    };
})();