// sudo apt-get install nodejs npm
// npm install irc
// npm install fs


var channel = '#sandbox';

var http = require('http');
var https = require('https');
var fs = require('fs');
var PlugAPI = require('plugapi');
var irc = require("irc");
var _ = require('lodash');

var messages = fs.readFileSync('./dbs.txt').toString().split('\n');
var lunch = ['Chipotle', 'Market District', 'Palermo', 'Sams'];
var lunch_messages = ['I could sure composite some ',
                      'Oh god oh god please bring me a TABLE of ',
                      'Been far too long since I extracted some '];

var magic8 = ['Signs point to hell yes.',
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

var config_file = JSON.parse(fs.readFileSync('./dbconfig.txt'));
var meme_config = JSON.parse(fs.readFileSync('./memeconfig.json'));

var config = {
	channels: [channel],
	server: config_file.server,
	botName: "dbstewardess",
  memeUser: config_file.imgflipuser,
  memePass: config_file.imgflippass,
  userAgent: 'DBStewardess (Awesomesauce Distro)/1.0'
};

var actions = {};

function action(name) {
  if (!(name in actions)) {
    actions[name] = require('./actions/' + name);
  }
  return actions[name];
}

var triggers = [];

triggers.push({
  toSelf: true,
  mediums: ['irc'],
  regex: /^CMDLIST/,
  action: function(dbs) {
    dbs.reply(messages.toString());
  }
});

triggers.push({
  toSelf: true,
  mediums: ['irc'],
  regex: /^MEME\s*(.*)/,
  action: function(dbs, data) {
    try {
      var memeMessage = 'Must be in format: {"memeId": numeric (https://api.imgflip.com/popular_meme_ids), "memeTrigger": "string greater than 3, possibly regex", "memeText1": "string, possibly with backreferences" "memeText2": "string, possibly with backreferences", "memeLabel": "an optional label for the meme"}, e.g. {"memeId":61579,"memeLabel":"one does not simply","memeTrigger":"one does not simply (.*)","memeText1":"one does not simply","memeText2":"$1"}';
      var newmeme = JSON.parse(data.matches[1]);
      if (parseInt(newmeme.memeId) == Number.NaN ||
          newmeme.memeTrigger.length < 3) {
        dbs.reply(memeMessage);
      } else {
        meme_config.memes.push(newmeme);
        fs.writeFileSync('./memeconfig.json', JSON.stringify(meme_config, null, 2));
        dbs.reply('Yeahhhhhhhhhhhhhhhhhhhhh Boy');
        dbs.announce((newmeme.memeLabel || newmeme.memeTrigger) + ' meme in the house!');
      }
    } catch (e) {
      dbs.reply('Could not parse JSON. ' + e.toString() + ' ' + memeMessage);
    }
  }
});

triggers.push({
  toSelf: true,
  mediums: ['irc'],
  regex: /^PUPPET\s*(.*)/,
  action: function(dbs, data) {
    dbs.reply('Oooo nice hands');
    dbs.announce(data.matches[1]);
  }
});

triggers.push({
  toSelf: true,
  mediums: ['irc'],
  regex: /(.*)/,
  action: function(dbs, data) {
    fs.appendFile('./dbs.txt', data.message + '\n', function(err) {
      if (err) {
        dbs.reply('I could not save your text to a file :(');
      } else {
        dbs.reply('Oooo, I extracted that xml');
        dbs.announce('I received a new row from ' + data.from + '!!1!');
        messages.push(data.message);
      }
    });
  }
});

triggers.push({
  mediums: ['irc','plug'],
  regex: /dbstewardess.*\?$/i,
  action: action('random')(magic8)
});

triggers.push({
  mediums: ['irc','plug'],
  regex: /dbstewardess/i,
  action: action('random')(messages)
});

var lastLunchTime;
triggers.push({
  mediums: ['irc','plug'],
  regex: /lunch|food|hungry/i,
  action: function(dbs, data) {
    var newLunchTime = (new Date()).getDate();
    if (lastLunchTime != newLunchTime) {
      lastLunchTime = newLunchTime;

      if (data.message.match(/pmo|palermo/i)) {
        dbs.announce('Oh yeah a TABLE full of pizza');
      } else {
        dbs.announce(lunch_messages[Math.floor(Math.random() * lunch_messages.length)] +
                lunch[Math.floor(Math.random() * lunch.length)]);
      }
    }
  }
});

triggers.push({
  mediums: ['irc', 'plug'],
  regex: /stupid\s+([\w\s]+)/i,
  action: function(dbs, data) {
    dbs.announce('Meeseek open ' + data.from + '\'s stupid ' + data.matches[1]);
  }
});

triggers.push({
  mediums: ['irc','plug'],
  regex: /(jira.*down)|(down.*jira)/i,
  action: action('isthejiradown')
});

triggers.push({
  mediums: ['irc','plug'],
  regex: /flip.*coin/i,
  action: action('flipacoin')
});

meme_config.memes.forEach(function(m){
  triggers.push({
    mediums: ['irc','plug'],
    regex: new RegExp(m.memeTrigger, 'i'),
    action: action('meme')(m)
  });
});

var bot = new irc.Client(config.server, config.botName, {
  debug: true,
  channels: config.channels,
  password: config_file.password,
  	selfSigned: true,
    secure: true
});

setTimeout(function() {
	bot.disc
})

// only talk lunch once a day
var lastLunchTime;
var memeMessage = 'Must be in format: {"memeId": numeric (https://api.imgflip.com/popular_meme_ids), "memeTrigger": "string greater than 3, possibly regex", "memeText1": "string, possibly with backreferences" "memeText2": "string, possibly with backreferences", "memeLabel": "an optional label for the meme"}, e.g. {"memeId":61579,"memeLabel":"one does not simply","memeTrigger":"one does not simply (.*)","memeText1":"one does not simply","memeText2":"$1"}';

console.log(config_file.jenkinsjob);
var lastBuild = '';
var jenkinsOptions = {
	hostname: config_file.jenkinshost,
	path: '/jenkins/job/' + config_file.jenkinsjob + '/lastBuild/api/json',
	port: 443,
	auth: config_file.jenkinsusertoken,
	method: 'GET',
	rejectUnauthorized: 0
};

/*
Jenkins logic needs rewired
setInterval(function() {
https.get(jenkinsOptions,
	function(response) {
		var body = '';
		response.on('data', function(d) {
			body += d;
		});
		response.on('end', function() {
			var parsed = JSON.parse(body);
			
			if (parsed.number != lastBuild) {
				lastBuild = parsed.number;
				if (parsed.result == 'FAILURE') {
					bot.say(channel, "Failed Jenkins " + config_file.jenkinsjob + " " + parsed.number + " - " + parsed.url + "console");
					var commitNotReg = /commit notification (.*)/;
					for (var action in parsed.actions) {
						for (var cause in parsed.actions[action].causes) {
							var culprits = [];
							for (var culprit in parsed.culprits) {
								culprits.push(parsed.culprits[culprit].fullName);
							}
							var matches = parsed.actions[action].causes[cause].shortDescription.match(commitNotReg);
							if (matches.length > 0) {
								bot.say(channel, "Triggered by " + config_file.stashurl + matches[1] + ". Culprits: " + culprits.join(", ") );
							}
						}
					}
				}
			}
		});
	});},
60000
);*/

bot.addListener("message", function(from, to, text, message) {
	messageReceived(from, to, text, message, "irc");
});

bot.addListener('error', function(message) {
  console.warn('error: ', message);
});

function chat(channel, from, message, medium) {
	if (medium == "irc") {
		if (channel != null) {
			bot.say(channel, message);
		}
		else {
			bot.say(from, message);
		}	
	}
}

function messageReceived(from, to, text, message, medium) {
  var dbstewardess = {
    config: config,
    reply: function(message) {
      chat(null, from, message, medium);
    },
    announce: function(message) {
      chat(channel, null, message, medium);
    }
  };
  var data = {
    from: from,
    to: to,
    message: text,
    medium: medium
  };

  _.some(triggers, function(t) {
    if (t.toSelf && to != config.botName) {
      return false;
    }
    if (t.mediums.indexOf(medium) === -1) {
      return false;
    }
    if (t.regex) {
      var matches = text.match(t.regex);
      if (matches !== null) {
        data.matches = matches;
        data.trigger = t;
        t.action(dbstewardess, data);
        return true;
      }
    }
    return false;
  });
}


