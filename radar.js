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
.action(function(speciesName){
  require('./actions/conquest').addPokemonLink(wiki, function(err){
    if (err) return console.log(err.message);
    console.log('Finish adding Pokémon Conquest Pokémon max links.');
  });
});


program
.command('item-info')
.description('Get the info of items.')
.action(function(item){
  require('./actions/item').getItemInfo(wiki, function(err, info){
    if (err) return console.log(err.message);
    console.log(JSON.stringify(info));
  });
});

program
.command('item-image')
.description('Get the images of items.')
.action(function(item){
  require('./actions/item').getItemImage(wiki, function(err, urls){
    if (err) return console.log(err.message);
    console.log(JSON.stringify(urls));
  });
});

if (program.parse(process.argv).args.length == 0) {
  program.help();
}