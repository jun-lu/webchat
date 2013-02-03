
/*
 * GET chat page.
 */

exports.chat = function(req, res){
  res.render('chat', { title: 'Express' });
}