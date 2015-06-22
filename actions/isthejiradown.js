var http = require('http');

function isthejiradown(dbstewardess) {
  http.get({
    host: 'www.isthejiradown.com',
    path: '/',
    headers: {'User-Agent': dbstewardess.config.userAgent}
  }, function (res) {
    var jira_response = '';
    var h1 = /<h1>(.*)<\/h1>/;
    var p = /<p>(.*)<\/p>[\s\S]*<p>(.*)<\/p>/;

    res.on('data', function(chunk) {
      var match = h1.exec(chunk);
      if (match !== null) {
        jira_response += match[1] + '. ';
      }
      match = p.exec(chunk);
      if (match !== null) {
        jira_response += match[1] + ' ' + match[2];
      }
    });

    res.on('end', function() {
      dbstewardess.announce(jira_response);
    });
  });
}

module.exports = isthejiradown;