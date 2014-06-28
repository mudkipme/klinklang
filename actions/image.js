var async = require('async');
var _ = require('underscore');
var Species = require('../models/species');
var Wiki = require('../models/wiki');

var uploadDreamWorld = function(wiki, filename, callback){
  Species.allNames('en', function(err, names){

    var url = 'http://static-local.52poke.com/wikipic/DW2/' + filename;
    var index = parseInt(filename), match = filename.split('.')[0].match(/[A-z]+/);
    match = match && match[0];

    var file = ('00' + index).substr(-3) + names[index] + ' Dream';
    match && (file += ' ' + match);
    file += '.png';

    wiki.remoteUpload(file, url, callback);
  });
};

var uploadXYSprites = function(wiki, callback){
  async.eachSeries(_.range(650, 719), function(number, next){
    var url = 'http://static-local.52poke.com/wikipic/sprite/xy/pokemon/' + number + '.png';
    wiki.remoteUpload(number + '.png', url, next);
  }, callback);
};

var uploadMega = function(wiki, filename, callback){
  filename = filename.replace(/\.png$/, '');
  var url = 'http://static-local.52poke.com/wikipic/sprite/xy/mega/' + filename + '.png';
  var filename = filename + 'MS.png';
  wiki.remoteUpload(filename, url, callback);
};

var importImage = function(wiki, filename, callback){
  var bulba = new Wiki({api: 'http://archives.bulbagarden.net/w/api.php'});
  bulba.imgUrl(filename, function(err, url){
    url = url.replace(/archives\./, 'cdn.');
    wiki.remoteUpload(filename, url, callback);
  });
};

var importSprite = function(wiki, number, callback){
  var spriteTypes = [
    {fr: 'Sprite 6 x 001.png', zh: 'Spr 6x 001.png'},
    {fr: 'Sprite 6 dos 001.png', zh: 'Spr b 6x 001.png'},
    {fr: 'Sprite 6 x 001 s.png', zh: 'Spr 6x 001 s.png'},
    {fr: 'Sprite 6 dos 001 s.png', zh: 'Spr b 6x 001 s.png'},
    {fr: 'Sprite 6 x 001 m.png', zh: 'Spr 6x 001 m.png'},
    {fr: 'Sprite 6 dos 001 m.png', zh: 'Spr b 6x 001 m.png'},
    {fr: 'Sprite 6 x 001 m s.png', zh: 'Spr 6x 001 m s.png'},
    {fr: 'Sprite 6 dos 001 m s.png', zh: 'Spr b 6x 001 m s.png'},
    {fr: 'Sprite 6 x 001 f.png', zh: 'Spr 6x 001 f.png'},
    {fr: 'Sprite 6 dos 001 f.png', zh: 'Spr b 6x 001 f.png'},
    {fr: 'Sprite 6 x 001 f s.png', zh: 'Spr 6x 001 f s.png'},
    {fr: 'Sprite 6 dos 001 f s.png', zh: 'Spr b 6x 001 f s.png'}
  ];

  var pokepedia = new Wiki({api: 'http://www.pokepedia.fr/api.php'});
  number = ('00'+number).substr(-3);

  async.eachSeries(spriteTypes, function(spriteType, next){
    pokepedia.imgUrl(spriteType.fr.replace('001', number), function(err, url){
      if (!url) return next();
      wiki.remoteUpload(
        spriteType.zh.replace('001', number)
        ,url
        ,{text: "== 授权协议 ==\n{{i-Fairuse-game}}\n[[fr:Fichier:" + spriteType.fr.replace('001', number) + "]]"}
        ,next);
    });
  }, callback);
};

var uploadXYAniSprites = function(wiki, number, callback){
  var filename;
  async.waterfall([
    async.apply(Species.name, number, 'en')
    ,function(name, next){
      filename = name.toLowerCase()
      .split('♂').join(' m').split('♀').join(' f')
      .split("'").join('').split(' ').join('_') + '.png';

      wiki.remoteUpload('Spr 6x ' + ('00' + number).substr(-3) + '.png'
        ,'http://static-local.52poke.com/wikipic/sprite/xy/ani/' + filename
        ,{text: "{{图片信息|source=[http://www.pkparaiso.com/xy/sprites_pokemon.php Pokémon Paraíso]|about=游戏}}"}
        ,next);
    }
  ], callback);
};

var spriteTemplate = function(wiki, number, callback){
  var title = '', types = [];

  async.waterfall([
    async.apply(Species.name, number, 'zh')
    ,function(name, next){
      title = name;
      Species.typeName(number, next);
    }
    ,function(typeName, next){
      types = '|type=' + typeName[0];
      typeName.length > 1 && (types += '\n|type2=' + typeName[1]);
      wiki.getSection(title, '形象', next);
    }
    ,function(text, rvsection, next){
      if (!text) return next();

      content = [
        '===形象==='
        ,'{{形象'
        ,types
        ,'|gen=6'
        ,'|ndex=' + number + '}}'
      ].join('\n');

      wiki.edit(title, content, {section: rvsection}, next);
    }
  ], callback);
};

exports.register = function(program, wiki){
  program
  .command('dream-image <filename>')
  .description('Upload the artwork of Dream World.')
  .action(function(filename){
    uploadDreamWorld(wiki, filename, function(err, data){
      if (err) return console.log(err.message);
      console.log(JSON.stringify(data));
    });
  });


  program
  .command('xy-sprites')
  .description('Upload the sprites in Pokémon X & Y.')
  .action(function(filename){
    uploadXYSprites(wiki, function(err, data){
      if (err) return console.log(err.message);
      console.log('Finished.');
    });
  });

  program
  .command('mega-icons <filename>')
  .description('Upload the icons of Mega Pokémon.')
  .action(function(filename){
    uploadMega(wiki, filename, function(err, data){
      if (err) return console.log(err.message);
      console.log(JSON.stringify(data));
    });
  });

  program
  .command('import-image <filename>')
  .description('Import certain image from other wikis.')
  .action(function(filename){
    importImage(wiki, filename, function(err, data){
      if (err) return console.log(err.message);
      console.log(JSON.stringify(data));
    });
  });

  program
  .command('xy-ani-sprite <number>')
  .description('Upload animated sprites of Pokémon X & Y.')
  .action(function(number){
    uploadXYAniSprites(wiki, number, function(err, data){
      if (err) return console.log(err.message);
      console.log(JSON.stringify(data));
    });
  });

  program
  .command('sprite-template <number>')
  .description('Added sprite template to Pokémon articles.')
  .action(function(number){
    spriteTemplate(wiki, number, function(err, data){
      if (err) return console.log(err.message);
      console.log(JSON.stringify(data));
    });
  });

  program
  .command('import-sprite <number>')
  .description('Import the XY sprites from French Wiki Poképédia.')
  .action(function(number){
    importSprite(wiki, number, function(err, data){
      if (err) return console.log(err.message);
      console.log('Imported '+number);
    });
  });
};