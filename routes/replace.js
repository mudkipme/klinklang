var replacer = require('../models/replacer');

module.exports = function(req, res){
  replacer.replaceText(req.body.source, {
    texts: req.body.texts
    ,sourceLng: req.body.sourceLng
    ,resultLng: req.body.resultLng
  }, function(err, result){
    res.json({result: (err && err.message) || result});
  });
};