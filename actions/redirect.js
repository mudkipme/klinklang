var replacer = require('../models/replacer');
var async = require('async');

exports.register = function(program, wiki){
  program
  .command('redirect <source> <dest>')
  .description('Create redirect.')
  .action(function(source, dest){
    wiki.redirect(source, dest, function(err, result){
      if (err) return console.log(err.message);
      console.log(JSON.stringify(result));
    });
  });

  program
  .command('redirect-all <type> [appendix]')
  .description('Create redirect from translation table.')
  .action(function(type, appendix){

    appendix = appendix ? ('（' + appendix + '）') : '';

    replacer.loadText([type], function(err, results){
      if (err) return console.log(err.message);

      async.eachSeries(results[0], function(row, next){
        wiki.redirect(row.en, row.zh + appendix, function(err, result){
          if (err) return next(err);
          console.log(result);
          wiki.redirect(row.ja, row.zh + appendix, function(err, result){
            if (err) return next(err);
            console.log(result);
            next(null);
          });
        });
      }, function(err){
        if (err) return console.log(err.message);
      });
    });


    // wiki.redirect(source, dest, function(err, result){
    //   if (err) return console.log(err.message);
    //   console.log(JSON.stringify(result));
    // });
  });
};