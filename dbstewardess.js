// sudo apt-get install nodejs npm
// npm install irc
// npm install fs

var channel = '#publicchan';
//var channel = '#sandbox';

var http = require('http');
var fs = require('fs');

var messages = fs.readFileSync('./dbs.txt').toString().split('\n');
var lunch = ['Chipotle', 'Market District', 'Palermo', 'Sams'];
var lunch_messages = ['I could sure composite some ',
                      'Oh god oh god please bring me a TABLE of ',
                      'Been far too long since I extracted some '];

var config_file = JSON.parse(fs.readFileSync('./dbconfig.txt'));
var meme_config = JSON.parse(fs.readFileSync('./memeconfig.json'));

var config = {
	channels: [channel],
	server: config_file.server,
	botName: "dbstewardess",
        memeUser: config_file.imgflipuser,
        memePass: config_file.imgflippass
};

var irc = require("irc");

var bot = new irc.Client(config.server, config.botName, {
  debug: true,
  channels: config.channels,
  password: config_file.password
});

setTimeout(function() {
	bot.disc
})

// only talk lunch once a day
var lastLunchTime;
var memeMessage = 'Must be in format: {"memeId": numeric (https://api.imgflip.com/popular_meme_ids), "memeTrigger": "string greater than 3, possibly regex", "memeText1": "string, possibly with backreferences" "memeText2": "string, possibly with backreferences", "memeLabel": "an optional label for the meme"}, e.g. {"memeId":61579,"memeLabel":"one does not simply","memeTrigger":"one does not simply (.*)","memeText1":"one does not simply","memeText2":"$1"}';

bot.addListener("message", function(from, to, text, message) {
  if (to == "dbstewardess") {
    if (text.match(/CMDLIST/)) {
      bot.say(from, messages.toString());
    }
    else if (text.match(/^MEME/)) {
      try {
        var newmeme = JSON.parse(text.substring(4));
        if (parseInt(newmeme.memeId) == Number.NaN ||
            newmeme.memeTrigger.length < 3) {
          bot.say(from, memeMessage);
        }
        else {
          meme_config.memes.push(newmeme);
          fs.writeFileSync('./memeconfig.json', JSON.stringify(meme_config));
          bot.say(from, 'Yeahhhhhhhhhhhhhhhhhhhhh Boy');
          bot.say(channel, (newmeme.memeLabel || newmeme.memeTrigger) + ' meme in the house!');
        }
      }
      catch (e) {
        bot.say(from, 'Could not parse JSON. ' + memeMessage);
      }
    }
    else if (text.match(/^PUPPET/)) {
      bot.say(from, 'Oooo nice hands');
      bot.say(channel, text.substring(6));
    }
    else {
      fs.appendFile('./dbs.txt', text + '\n', function(err) {
        if (err) {
          bot.say(from, 'I could not save your text to a file :(');
        }
        else {
          bot.say(from, 'Oooo, I extracted that xml');
        }
      });
      bot.say(channel, 'I received a new row from ' + from + '.');
      messages.push(text);
    }
  }
  else if (text.match(/dbstewardess/i)) {
    if (text.match(/\?$/)) {
      // magic 8ball
      var an8th = ['Signs point to hell yes.',
                   'Yes.',
                   'Reply caught in a drug induced haze, try again.',
                   'No doubt.',
                   'My source code says no.',
                   'As I see it, yes.',
                   'You may rely on it.',
                   'Concentrate and ask again.',
                   'Outlook not so good. (Thunderbird sucks too)',
                   'It is decidedly so.',
                   'Better not tell you now.',
                   'Very doubtful.',
                   'Yes - definitely.',
                   'It is as certain as rusty sells drugs',
                   'Cannot predict now',
                   'Most likely',
                   'Ask again after you have eaten a burrito',
                   'My reply is no.',
                   'Outlook good. Fire bad.',
                   'Do not count on it.'];
      bot.say(channel,
              an8th[Math.floor(Math.random() * an8th.length)]);
    }
    else {
      bot.say(channel, messages[Math.floor(Math.random() * messages.length)]);
    }
  }
  else if (text.match(/lunch/i) || text.match(/food/i) || text.match(/hungry/i)) {
	var newLunchTime = (new Date()).getDate();
	if (lastLunchTime != newLunchTime) {
	  lastLunchTime = newLunchTime;
	
      if (text.match(/pmo/i) || text.match(/palermo/i)) {
        bot.say(channel,
                "Oh yeah a TABLE full of pizza");
      }
      else {
        bot.say(channel,
                lunch_messages[Math.floor(Math.random() * lunch_messages.length)] +
                lunch[Math.floor(Math.random() * lunch.length)]);
      }
    }
  }

  else if (text.match(/creasy/i)) {
    var genetiks= ['NO NO NO NO NO NO NO NO NON ONONO NONONONON NONO NON ONONONO NO NO NO NO NO NO',
                   'You can do that if you are stupid'];
    bot.send("NICK", "bcreasy");
    bot.say(channel,
            genetiks[Math.floor(Math.random() * genetiks.length)]);
    bot.send("NICK", "dbstewardess");
  }
  else if (text.match(/jira/i) && text.match(/down/i)) {
    var jira_response = "";
    var not_response = "";
    http.get("http://www.isthejiradown.com", function(res) {
      
      res.on('data', function(chunk) {
        var h1 = /<h1>(.*)<\/h1>/;
        var p = /<p>(.*)<\/p>[\s\S]*<p>(.*)<\/p>/;
        if (h1.exec(chunk) != null) {
          var match = h1.exec(chunk);
          jira_response += match[1] + ". ";
        }
        if(p.exec(chunk) != null) {
          var match = p.exec(chunk);
          jira_response += match[1] + " ";
          jira_response += match[2];
        }
        
      });

      res.on('end', function() {
        bot.say(channel,
                jira_response);
      });
    });
  }
  else {
    for (var i = 0; i < meme_config.memes.length; i++) {
      var m = meme_config.memes[i];
      var reg = new RegExp(m.memeTrigger, 'i');
      console.log('match?', text, m.memeTrigger, console.log(text.match(reg)));
      if (text.match(reg)) {
          var match = text.match(reg);

          var trigger = m.memeTrigger;
          var text1 = substitute(m.memeText1, match);
          var text2 = substitute(m.memeText2, match);
          console.log('MEME:', m.memeId, text1, text2);
          var call = "http://api.imgflip.com/caption_image?username=" + encodeURIComponent(config.memeUser) +
            "&password=" + encodeURIComponent(config.memePass) +
            "&template_id=" + m.memeId +
            "&text0=" + encodeURIComponent(text1) +
            "&text1=" + encodeURIComponent(text2);
          var label = m.memeLabel || trigger;
          http.get(call,
            function(res) {
              res.on('data', function(chunk) {
                try {
                  bot.say(channel, "You didn't forget to say " + label + "! " + JSON.parse(chunk).data.page_url);
                }
                catch (err) {
                  bot.say(from, "API call to your meme failed :( - " + call);
                  console.error(err);
                }
              } 
          )});
      }
    }
  }
});

function substitute(text, matches) {
  return text.replace(/\$(\d+)/, function(_, n) {
    return matches[parseInt(n)];
  });
}

