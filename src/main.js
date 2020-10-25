import Chat from 'twitch-chat-emotes';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const bubble_size = 25;
const emote_size = 50;

const bubble_img = new Image();
bubble_img.src = require('./bubble.png');

function resize() {
	canvas.width = window.innerWidth * devicePixelRatio;
	canvas.height = window.innerHeight * devicePixelRatio;
}

function init() {
	document.body.appendChild(canvas);

	window.addEventListener('resize', resize);
	resize();

	bubbleTimeout();
	setTimeout(bubbleTimeout, 3000);
	setTimeout(bubbleTimeout, 5000);
}

const bubbleTimeout = () => {
	spawnBubbles();
	setTimeout(bubbleTimeout, Math.random() * 10000 + 2500);
}

const bubbles = [];
const spawnBubbles = () => {
	const x = Math.random() * canvas.width;
	const bubbleCount = Math.floor(Math.random() * 10);
	const r = Math.random() * 7;
	const speed = Math.random() + 0.5;

	let offset = 0;
	for (let index = 0; index < bubbleCount; index++) {
		const thisBubbleScale = 1 - (index) / bubbleCount;
		bubbles.push({
			y: canvas.height + offset,
			x,
			index,
			size: thisBubbleScale,
			r,
			speed,
		});
		offset += (100 * Math.random() + 50) * (thisBubbleScale * 2);
	}
}

const emotes = [];
let last_frame = Date.now();
function draw() {
	const delta = (Date.now() - last_frame) / 1000;
	last_frame = Date.now();
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (let index = bubbles.length - 1; index >= 0; index--) {
		bubbles[index].y -= delta * 200 * bubbles[index].speed;

		ctx.drawImage(
			bubble_img,
			bubbles[index].x + Math.sin(bubbles[index].y / 100 + bubbles[index].index / 4 + bubbles[index].r) * (bubble_size * devicePixelRatio / 2),
			bubbles[index].y,
			bubble_size * devicePixelRatio * bubbles[index].size,
			bubble_size * devicePixelRatio * bubbles[index].size,
		);

		if (bubbles[index].y < -bubble_size * devicePixelRatio) {
			bubbles.splice(index, 1);
		}
	}

	/*for (let index = 0; index < weeds.length; index++) {
		const weed = weeds[index];
		weed.tick(delta);
	}*/

	for (let i = pendingEmoteArray.length - 1; i >= 0; i--) {
		const element = pendingEmoteArray.splice(i, 1)[0].emotes;
		const group = {
			emotes: [],
			y: canvas.height + element.length * emote_size * devicePixelRatio,
			x: Math.random() * canvas.width,
			spawn: Date.now(),
			r: Math.random(),
			speed: Math.random() + 0.5,
		};
		for (let o = 0; o < element.length; o++) {
			const emote = emoteTextures[element[o].material.id];
			group.emotes.push(emote);
		}

		emotes.push(group);
	}
	for (let i = emotes.length - 1; i >= 0; i--) {
		const group = emotes[i];
		group.y -= delta * 150 * group.speed;
		ctx.translate(group.x, group.y);
		if (group.emotes.length > 1) ctx.rotate(Math.PI / 2);
		for (let o = 0; o < group.emotes.length; o++) {
			const element = group.emotes[o];
			const sinMath = Date.now() / 1000 + group.r * 10 - (o);
			const sin = Math.sin(sinMath);
			ctx.save();
			ctx.translate(
				group.emotes.length > 1 ? emote_size * devicePixelRatio * o : (sin * emote_size * devicePixelRatio),
				group.emotes.length > 1 ? sin * emote_size * devicePixelRatio * 0.5 : 0
			);
			if (group.emotes.length > 1) ctx.rotate(-Math.sin(sinMath + Math.PI / 2) / 2);
			ctx.drawImage(
				element,
				-emote_size * devicePixelRatio / 2,
				-emote_size * devicePixelRatio / 2,
				emote_size * devicePixelRatio,
				emote_size * devicePixelRatio
			);
			ctx.restore();
		}
		if (group.y < -emote_size * devicePixelRatio * group.emotes.length) {
			emotes.splice(i, 1);
		}

		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}

	window.requestAnimationFrame(draw);
}


let channels = ['moonmoon', 'antimattertape'];
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});
if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}

const ChatInstance = new Chat({
	channels,
	duplicateEmoteLimit: 5,
	//duplicateEmoteLimit_pleb: 5,
})

const emoteTextures = {};
const pendingEmoteArray = [];
ChatInstance.on("emotes", (e) => {
	const output = { emotes: [] };
	for (let index = 0; index < Math.min(7, e.emotes.length); index++) {
		const emote = e.emotes[index];
		if (!emoteTextures[emote.material.id]) {
			emoteTextures[emote.material.id] = emote.material.canvas;
		}
		emote.texture = emoteTextures[emote.material.id];
		output.emotes.push(emote);
	}
	pendingEmoteArray.push(output);
});

const eelImageSrc = [
	require(`./eel/eel_1.png`),
	require(`./eel/eel_2.png`),
	require(`./eel/eel_3.png`),
	require(`./eel/eel_4.png`),
	require(`./eel/eel_5.png`),
	require(`./eel/eel_6.png`),
	require(`./eel/eel_7.png`),
	require(`./eel/eel_8.png`),
	require(`./eel/eel_9.png`),
	require(`./eel/eel_10.png`),
	require(`./eel/eel_11.png`),
	require(`./eel/eel_12.png`),
	require(`./eel/eel_13.png`),
	require(`./eel/eel_14.png`),
	require(`./eel/eel_15.png`),
	require(`./eel/eel_16.png`),
	require(`./eel/eel_17.png`),
	require(`./eel/eel_18.png`),
	require(`./eel/eel_19.png`),
	require(`./eel/eel_20.png`),
];

const eelImages = new Array(20);
for (let index = 0; index < eelImages.length; index++) {
	eelImages[index] = new Image();
	/*eelImages[index].addEventListener('load', ()=>{
		if (eelCanvas.height < eelImages[index].height) eelCanvas.height = Math.max(eelCanvas.height, eelImages[index].height);
		if (eelCanvas.width < eelImages[index].width) eelCanvas.width = Math.max(eelCanvas.width, eelImages[index].width);
	});*/
	eelImages[index].src = eelImageSrc[index];
}


window.addEventListener('DOMContentLoaded', () => {
	init();
	draw();
})