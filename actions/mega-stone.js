var _ = require('underscore');
var async = require('async');
var replacer = require('../models/replacer');

var megaPM = [
  ['水箭龟']
  ,['胡地']
  ,['耿鬼']
  ,['袋龙']
  ,['大甲']
  ,['暴鲤龙']
  ,['化石翼龙']
  ,['超梦', 'X']
  ,['超梦', 'Y']
  ,['电龙']
  ,['巨钳螳螂']
  ,['赫拉克罗斯']
  ,['黑鲁加']
  ,['班吉拉']
  ,['大嘴娃']
  ,['波士可多拉']
  ,['恰雷姆']
  ,['雷电兽']
  ,['诅咒娃娃']
  ,['阿勃梭鲁']
  ,['烈咬陆鲨']
  ,['暴雪王']
];

exports.megaStone = function(wiki, callback){
  replacer.loadText(['pokemon'], function(err, results){
    if (err) return callback(err);
    var table = results[0];

    async.eachSeries(megaPM, function(item, next){
      var trans = _.findWhere(table, {zh: item[0]});
      var zhName = trans.zh, enName = trans.en, jaName = trans.ja;
      var appendix = item[1] || '';

      var title = zhName+'石'+appendix+'（道具）';
      var content = '{{暂译}}\n{{預告提示}}\n{{道具信息框\n|bag=重要道具\n|name='+zhName+'石'+appendix
        +'\n|jpname='+jaName+'イト'+appendix+'\n|enname='+enName+'ite'+appendix
        +'\n|info=不可思议的百万石。'+zhName+'持有后，可以在战斗中进行百万进化。'
        +'\n|occasion=no\n|gen=六}}'
        +'\n{{N|'+zhName+'石'+appendix+'||'+jaName+'イト'+appendix+'|'+enName+'ite'+appendix+'}}是一个[[重要道具]]。'
        +'\n\n==游戏中==\n可以让'+zhName+'在对战中进化为百万'+zhName+appendix+'。\n\n==获得方式=='
        +'\n\n==细节==\n{{百万石}}\n{{神奇宝贝百科道具工程}}\n\n[[Category:重要道具]]';

      wiki.edit(title, content, next);
    }, callback);
  });
};