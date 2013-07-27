#!/usr/bin/env node

var program = require('commander');
var request = require('request');
var fs = require('fs');
var Wiki = require('./models/wiki');
var jar = request.jar();

program.version(require('./package.json').version);

if (fs.existsSync(__dirname + '/database/cookie-jar.txt')){
  var cookies = JSON.parse(fs.readFileSync(
    __dirname + '/database/cookie-jar.txt'
    ,{encoding: 'utf8'}
  ));

  cookies.forEach(function(cookie){
    jar.add(request.cookie(cookie));
  });
};

var wiki = new Wiki({jar: jar});

var saveCookie = function(){
  var cookies = [];
  jar.cookies.forEach(function(cookie){
    cookies.push(cookie.str);
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
.command('conquest-add-move-power')
.description('Add conquest move power.')
.action(function(){
  require('./actions/conquest').addMovePower(wiki, function(err){
    if (err) return console.log(err.message);
    console.log('Finish adding conquest move power.');
  });
});

if (program.parse(process.argv).args.length == 0) {
  program.help();
}