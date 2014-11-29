var fs = require('fs');
var async = require('async');
var parse = require('csv-parse');
var tongwen = require('tongwen');

var yuePokemon = function(wiki, callback){
  var input = fs.createReadStream(__dirname + '/../database/zh-yue/pokemon.csv');
  var actions = [];
  var parser = parse();

  var readRecord = function(record){
    if (record[1] == record[0]) return;

    actions.push(function(callback){
      wiki.getArticle(record[0], function(err, content){
        if (err) return callback(err);
        if (content.indexOf("|hk=") != -1) {
          return callback();
        }
        content = content.replace("{{N|" + record[0] + "|", '{{N|' + record[0] + '|hk=' + record[1] + '|');
        if (content.indexOf("|hk=") == -1) {
          content = content.replace("{{N|" + tongwen.s2t(record[0]) + "|", '{{N|' + tongwen.s2t(record[0]) + '|hk=' + tongwen.s2t(record[1]) + '|');
        }
        wiki.edit(record[0], content, callback);
      });
    });
  };

  parser.on('readable', function(){
    while(record = parser.read()){
      readRecord(record);
    }
  })
  .on('finish', function(){
    async.series(actions, callback);
  });

  input.pipe(parser);
}

exports.register = function(program, wiki){
  program
  .command('yue-pokemon')
  .description('Add zh-yue Pokémon names.')
  .action(function(){
    yuePokemon(wiki, function(err, data){
      if (err) return console.log(err.message);
      console.log(JSON.stringify(data));
    });
  });
};