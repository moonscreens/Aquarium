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
		if (!emoteCache[string]) {
			if (emotes !== null) {
				for (let i in emotes) {
					const arr = emotes[i][0].split('-');
					if (parseInt(arr[0]) === counter) {
						output.push({
							material: drawEmote('https://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0'),
							sprite: undefined,
						});
						emoteCache[string] = true;
					}
					break;
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


const bttvEmotes = {};
fetch('https://api.betterttv.net/2/channels/' + dehash(channels[0]), {
	mode: 'no-cors',
})
	.then(json => json.json())
	.then(data => {
		if (!data.status || data.status != 404) {
			for (let index = 0; index < data.emotes.length; index++) {
				const emote = data.emotes[index];
				bttvEmotes[emote.code] = emote.id;
			}
		}
	})

fetch('https://api.betterttv.net/3/cached/emotes/global', {
	mode: 'no-cors',
})
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
}

setTimeout(()=>{
	getEmoteArrayFromMessage('HACKERMANS  ', []);
}, 1000)

const emoteMaterials = {};

const drawEmote = (url) => {
	if (!emoteMaterials[url]) {
		const gif = new GIF(url);
		emoteMaterials[url] = gif;
	}
	return emoteMaterials[url];
}

module.exports = {emotes: toiletEmotesArray, materials: emoteMaterials};