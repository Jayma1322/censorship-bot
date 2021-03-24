const Discord = require('discord.js');

var config = require("./resources/config.json");

const bot = new Discord.Client();

var joinedEmbed = new Discord.MessageEmbed()
	.setTitle("Hey! Read this please!")
	.addField("Info","Okay, I might be a victim of this myself, but please don't delete this! (you can delete once you've read). This shows how to make the bot work to it's full potential and to stop you from thinking the bot's broken when it isn't.")
	.addField("Bypassing","To allow a user to bypass, there is 2 things you can do.\n1. Give the user the permission \"MANAGE_MESSAGES\". This is to prevent admins from having their messages removed.\n2. Give them a role called \"Bypass Filter\".")
	.addField("Reporting a vulnerability / uncensored word", "To do this, please DM <@287704540810182657>, or go into the support server (COMING SOON)")
	.addField("Raid Prevention", "This bot includes raid prevention. Users with the permission MANAGE_MESSAGES are exempt from this. If you are seeing false activations please report this as a bug, thank you.")
	.setFooter("Thanks for reading! Enjoy!");

var raidAlerted = []

bot.on('ready', () => {
	bot.user.setActivity("your language!", {
		type: "WATCHING"
	});
	console.log(bot.guilds.cache.size)
	console.log('bot ready')
	setInterval(function() {
		config = require('./resources/config.json')
	}, 60000);
});

bot.on('message', msg => {
	var bannedmsg = false
	if (msg.guild === null) return;
	if (msg.author.id == "822763227959918593") return;
	if(msg.member.roles.cache.find(r => r.name === "Bypass Filter")) return;
	var msgsplit = msg.content.split(" ");
	for(const banned in config.config.bannedwords) {
		if (bannedmsg) return;
		for (const wordn in msgsplit) {
			if (bannedmsg) return;
			if (msgsplit[wordn] === banned) {
				if (bannedmsg) return;
				msg.delete();
				var messageBannedEmbed = new Discord.MessageEmbed()
					.setTitle("You sent a blacklisted term!")
					.addField('Please refrain from using curse words / slurs.', 'The term you used was ' + banned)
					.setFooter('Original message: ' + msg.content)
				msg.author.send(messageBannedEmbed);
				bannedmsg = true
				break;
			}
		}
	}
	if (bannedmsg == false) {
		if (msg.mentions.users.array().length >= 6) {
			if (msg.guild.member(msg.author).hasPermission("MANAGE_MESSAGES")) return;
			if (raidAlerted.includes(msg.author.id)) {
				msg.author.send('RAID PREVENTION \|\| You have been banned from ' + msg.guild.name + " for tagging 5 users in one message, twice.");
				msg.channel.send("<@" + msg.author.id + "> has been banned for triggering raid prevention \|\| Tagged 5 users in one message, twice.");
				setTimeout(function() {
					msg.member.ban({ days: 3, reason: "Raid Prevention \|\| Tagged 5 users in one message, twice."});
				}, 3000);
			} else {
				msg.channel.send('RAID PREVENTION \|\| Please do not mention more than 5 users at a time, or else you may be automatically banned!')
				raidAlerted.push(msg.author.id)
			}
			bannedmsg = true
		};
		if (bannedmsg == true) return;
		var args = msg.content.split(" ");
		var cmd = args.shift().substring(2);

		if (cmd == "help" || cmd == "info") {
			var helpEmbed = new Discord.MessageEmbed()
				.setTitle('Here are your commands! Prefix: c!')
				.addField('Info', 'help - Lists all commands')
		};
		if (cmd == "blacklistedwords") {
			msg.channel.send('Are you sure you want to see this? The message includes profanity, slurs, and other words you generally don\'t want to see!\nValid responses: Yes, No')
			var filter = m => m.author.id === msg.author.id
			msg.channel.awaitMessages(filter, {
				max: 1,
				time: 30000,
				errors: ["time"]
			})
				.then(msg2 => {
					msg2 = msg2.first()
					if (msg2.content.toLowerCase() == "yes") {
						var string = ""
						for (const word in config.config.bannedwords) {
							string = string + "\n" + word
						}
						msg.channel.send('Check your DMs')
						msg.author.send(string)
					} else if (msg2.content.toLowerCase() == "no") {
						msg.channel.send('Cancelled')
					} else {
						msg.channel.send('Invalid response, command cancelled.')
					};
				})
				.catch(collected => {
					msg.channel.send('Timed out, command cancelled.')
				})
		}
		if (cmd == "eval" && msg.author.id == "287704540810182657") {
			var cmd = args.join(" ");
			var result = eval(cmd);

			if (typeof result !== "string") {
				result = require("util").inspect(result);
			};

			msg.channel.send(result, {
				code: "x1"
			});
		};
	};
});

bot.on('guildCreate', guild => {
	bot.users.fetch(guild.ownerID)
		.then(user => {
			user.send(joinedEmbed);
		});
});

bot.login("Token Here");