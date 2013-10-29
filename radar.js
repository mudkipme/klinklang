#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var request = require('request');
var _ = require('underscore');
var Wiki = require('./models/wiki');
var jar = request.jar();

program.version(require('./package.json').version);

if (fs.existsSync(__dirname + '/database/cookie-jar.txt')){
  var cookies = JSON.parse(fs.readFileSync(
    __dirname + '/database/cookie-jar.txt'
    ,{encoding: 'utf8'}
  ));

  _.each(cookies, function(cookie){
    jar.add(request.cookie(cookie));
  });
};

var wiki = new Wiki({jar: jar});

var saveCookie = function(){
  var cookies = _.map(jar.cookies, function(cookie){
    return cookie.str;
  });
  fs.writeFileSync(
    __dirname + '/database/cookie-jar.txt'
    ,JSON.stringify(cookies)
  );
};

program
.command('init')
.description('Init the Pokédex database.')
.action(function(){
  require('./actions/init').init(function(err){
    if (err) console.log(err.message);
  });
});


program
.command('init-translation')
.description('Init the Pokédex translation.')
.action(function(){
  require('./actions/init').initTranslation(function(err){
    if (err) console.log(err.message);
  });
});


program
.command('login <username> <password>')
.description('Login into the wiki.')
.action(function(username, password){
  wiki.login(username, password, function(err, result){
    if (err) return console.log(err.message);
    console.log('User ' + result.lgusername + ' logined.');
    saveCookie();
  });
});

program
.command('whoami')
.description('Get the information of current user.')
.action(function(){
  wiki.whoami(function(err, result){
    if (err) return console.log(err.message);
    console.log(result);
  });
});

program
.command('article <title> [section]')
.description('Get the content of an article or section.')
.action(function(title, section){
  var cb = function(err, content){
    if (err) return console.log(err.message);
    console.log(content);
  };

  if (section) {
    wiki.getSection(title, section, cb);
  } else {
    wiki.getArticle(title, cb);
  }
});

program
.command('pages-in-category <category>')
.description('List the members of a category.')
.action(function(category){
  wiki.getPagesInCategory(category, function(err, pages){
    if (err) return console.log(err.message);
    console.log(pages);
  });
});

program
.command('add-attr <title> <template> <key> <value>')
.description('Add attribute to a template text.')
.action(function(title, template, key, value){
  wiki.getArticle(title, function(err, content){
    if (err) return console.log(err.message);
    var obj = {};
    obj[key] = value;
    content = wiki.addAttrs(content, template, obj);
    if (!content) {
      console.log('Failed adding attribute.');
      return;
    }

    wiki.edit(title, content, function(err, res){
      console.log(res);
    });
  });
});

program
.command('get-attr <title> <section> <template>')
.description('Get the attributes of a template text.')
.action(function(title, section, template){
  wiki.getSection(title, section, function(err, content){
    if (err) return console.log(err.message);

    wiki.getAttrs(content, template, function(err, result){
      if (err) return console.log(err.message);

      console.log(JSON.stringify(result));
    });
  });
});

program
.command('conquest-add-move-power')
.description('Add Pokémon Conquest move power.')
.action(function(){
  require('./actions/conquest').addMovePower(wiki, function(err){
    if (err) return console.log(err.message);
    console.log('Finish adding Pokémon Conquest move power.');
  });
});

program
.command('conquest-add-pokemon-link')
.description('Add Pokémon Conquest Pokémon max links.')
.action(function(){
  require('./actions/conquest').addPokemonLink(wiki, function(err){
    if (err) return console.log(err.message);
    console.log('Finish adding Pokémon Conquest Pokémon max links.');
  });
});


program
.command('item-info')
.description('Get the info of items.')
.action(function(){
  require('./actions/item').getItemInfo(wiki, function(err, info){
    if (err) return console.log(err.message);
    console.log(JSON.stringify(info));
  });
});

program
.command('item-image')
.description('Get the images of items.')
.action(function(){
  require('./actions/item').getItemImage(wiki, function(err, urls){
    if (err) return console.log(err.message);
    console.log(JSON.stringify(urls));
  });
});

program
.command('mega-stone')
.description('Generate articles for Mega Stones.')
.action(function(){
  require('./actions/mega-stone').megaStone(wiki, function(err){
    if (err) return console.log(err.message);
    console.log('Finished.');
  });
});

program
.command('dream-image <filename>')
.description('Upload the artwork of Dream World.')
.action(function(filename){
  require('./actions/image').uploadDreamWorld(wiki, filename, function(err, data){
    if (err) return console.log(err.message);
    console.log(JSON.stringify(data));
  });
});

program
.command('xy-sprites')
.description('Upload the sprites in Pokémon X & Y.')
.action(function(filename){
  require('./actions/image').uploadXYSprites(wiki, function(err, data){
    if (err) return console.log(err.message);
    console.log('Finished.');
  });
});

if (program.parse(process.argv).args.length == 0) {
  program.help();
}