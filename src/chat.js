import * as THREE from 'three';
const tmi = require('tmi.js');
const GIF = require('./gifLoader.js');

let channels = ['moonmoon'];
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});
if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}

const client = new tmi.Client({
	options: { debug: false },
	connection: {
		reconnect: true,
		secure: true
	},
	channels: channels
});

window.addEventListener('load', () => {
	client.connect();
})


function dehash(channel) {
	return channel.replace(/^#/, '');
}
const emotes = {};

const checkIfBTTVEmote = (string) => {
	if (bttvEmotes[string] && !emotes[string]) {
		//emotes[string] = true;
		return drawEmote(bttvEmotes[string]);
	}
	return false;
}

function getEmoteArrayFromMessage(text, emotes) {
	const output = new Array();
	const stringArr = text.split(' ');
	let counter = 0;
	const emoteCache = {};
	for (let index = 0; index < stringArr.length; index++) {
		const string = stringArr[index];
		if (!emoteCache[string] || emoteCache[string] < 5) {
			if (emotes !== null) {
				for (let i in emotes) {
					for (let index = 0; index < emotes[i].length; index++) {
						const arr = emotes[i][index].split('-');
						if (parseInt(arr[0]) === counter) {
							output.push({
								material: drawEmote('https://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0'),
								sprite: undefined,
							});
							if (!emoteCache[string]) emoteCache[string] = 0;
							emoteCache[string]++;

							break;
						}
					}
				}
			}
			const bttvOutput = checkIfBTTVEmote(string);
			
			if (bttvOutput !== false) {
				output.push({
					material: bttvOutput,
					sprite: undefined,
				});
				emoteCache[string] = true;
			}
		}
		counter += string.length + 1;
	}

	if (output.length > 0) {
		toiletEmotesArray.push({
			progress: 0,
			x: Math.random(),
			y: Math.random(),
			emotes: output,
		})
	}
}

const channelIDs = {
	"moonmoon": 121059319,
	"antimattertape": 92640027,
}

const bttvEmotes = {};
fetch('https://api.betterttv.net/3/cached/users/twitch/' + channelIDs[dehash(channels[0])])
	.then(json => json.json())
	.then(data => {
		console.log(data);
		if (!data.status || data.status != 404) {
			for (let index = 0; index < data.sharedEmotes.length; index++) {
				const emote = data.sharedEmotes[index];
				bttvEmotes[emote.code] = emote.id;
			}
		}
	})

fetch('https://api.betterttv.net/3/cached/emotes/global')
	.then(json => json.json())
	.then(data => {
		if (data && data.length > 0) {
			for (let index = 0; index < data.length; index++) {
				const emote = data[index];
				bttvEmotes[emote.code] = emote.id;
			}
		}
	})


function handleChat(channel, user, message, self) {
	getEmoteArrayFromMessage(message, user.emotes);
}
client.addListener('message', handleChat);

const toiletEmotesArray = new Array();

if (window.devEnvironment || false) {
	const randomEmoteSelection = [
		'peepoT',
		'NOMMERS',
		'pepeJAM',
		'HACKERMANS',
	];
	setInterval(() => {
		getEmoteArrayFromMessage(randomEmoteSelection[Math.floor(Math.random() * randomEmoteSelection.length)], []);
	}, 100);

	setInterval(()=>{
		getEmoteArrayFromMessage('moon2EE moon2LL moon2LL moon2LL moon2LL Clap', {"301948071":["0-6"],"301948074":["8-14","16-22","24-30","32-38"]});
	}, 1000)
}


const emoteMaterials = {};

const drawEmote = (url) => {
	if (!emoteMaterials[url]) {
		const gif = new GIF(url);
		emoteMaterials[url] = gif;
	}
	return emoteMaterials[url];
}

module.exports = {emotes: toiletEmotesArray, materials: emoteMaterials};