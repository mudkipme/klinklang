var sass = require('node-sass');

module.exports = function(req, res){
  sass.render({
    data: req.body.text
    ,outputStyle: 'compressed'
  }, function(err, result) {
    if (err) return res.status(400).json({result: (err && err.message)});
    res.json({result: result.css.toString().split('}').join('}\n')});
  });
};
