var sass = require('node-sass');

module.exports = function(req, res){
  sass.render({
    data: req.body.text
    ,outputStyle: 'compressed'
    ,success: function(result){
      res.json({result: result.split('}').join('}\n')});
    }
    ,error: function(err){
      res.status(400).json({result: (err && err.message)});
    }
  });
};