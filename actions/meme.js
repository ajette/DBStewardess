var http = require('http');

module.exports = function(meme) {
  return function(dbstewardess, data) {
    var trigger = meme.memeTrigger;
    var text1 = substitute(meme.memeText1, data.matches);
    var text2 = substitute(meme.memeText2, data.matches);
    console.log('MEME:', meme.memeId, text1, text2);
    var imgurl = "caption_image?username=" + encodeURIComponent(dbstewardess.config.memeUser) +
      "&password=" + encodeURIComponent(dbstewardess.config.memePass) +
      "&template_id=" + meme.memeId +
      "&text0=" + encodeURIComponent(text1) +
      "&text1=" + encodeURIComponent(text2);
    var label = meme.memeLabel || trigger;

    http.get({
      host: 'api.imgflip.com',
      path: '/' + imgurl,
      headers: {'User-Agent': dbstewardess.config.userAgent}
    }, function(res) {
      var response = '';
      res.on('data', function(chunk) {
        response += chunk;
      });
      res.on('end', function() {
        try {
          dbstewardess.announce("You didn't forget to say " + label + "! " + JSON.parse(response).data.url);
        } catch (e) {
          dbstewardess.reply('API call to your meme failed :( ' + e.toString());
          console.error(e);
        }
      });
    });
  };
};

function substitute(text, matches) {
  return text.replace(/\$(\d+)/g, function(_, n) {
    return matches[parseInt(n)];
  });
}