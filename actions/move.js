/**
 * Move-related actions
 */

var createMoveDescription = function(wiki, name, description, callback){
  wiki.edit('Template:' + name, description + '<noinclude>[[Category:技能说明]]</noinclude>', callback);
}

exports.register = function(program, wiki){
  program
  .command('move-description <name> <description>')
  .description('Add move description templates.')
  .action(function(name, description){
    createMoveDescription(wiki, name, description, function(err, result){
      if (err) return console.log(err.message);
      console.log(JSON.stringify(result));
    });
  });
};