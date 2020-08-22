import * as PIXI from 'pixi.js';
import Chat from 'twitch-chat-emotes';
import Bubble from './bubble';
import Seaweed from './seaweed';

const config = {
	bubbleScale: 0.3,
	weed_count: 35,
	weed_height: 1,
};

const app = new PIXI.Application({
	transparent: true,
	autoResize: false,
	antialias: true,
	resolution: 2,
});

const centerContainer = new PIXI.Container();
app.stage.addChild(centerContainer);

function resize() {
	app.renderer.resize(
		window.innerWidth,
		window.innerHeight);

	centerContainer.x = Math.floor(window.innerWidth / 2);
	centerContainer.y = Math.floor(window.innerHeight / 2);

	const weedSize = window.innerHeight*config.weed_height;
	const weedScale = weedSize/8924;

	for (let index = 0; index < weeds.length; index++) {
		let ratio = Math.random();
		let scaleMultiplier = Math.random()/2 + 0.5;
		/*if (ratio > 0.5) {
			ratio = 1 - (ratio-0.5)*2;
			ratio = ratio*ratio/2+0.5;
			ratio = 1 - ratio + 0.5;
		} else {
			ratio = ratio*2;
			ratio = ratio*ratio;
			ratio = ratio/2;
		}*/

		const weed = weeds[index];
		weed.sprite.scale.x = weedScale*scaleMultiplier;
		weed.sprite.scale.y = weedScale*scaleMultiplier;
		weed.sprite.x = (window.innerWidth*ratio)*1.2 - window.innerWidth*0.1;
		weed.sprite.y = window.innerHeight;
	}
}

function init() {
	document.body.appendChild(app.view);
	app.ticker.add(draw);

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
	const x = Math.random() * window.innerWidth;
	const bubbleCount = Math.floor(Math.random() * 10);

	let offset = 0;
	for (let index = 0; index < bubbleCount; index++) {
		const thisBubbleScale = 1 - (index) / bubbleCount;

		bubbles.push(
			new Bubble(
				x,
				window.innerHeight + offset,
				thisBubbleScale * config.bubbleScale,
			)
		);
		offset += (100 * Math.random() + 50) * (thisBubbleScale * config.bubbleScale * 2);
		app.stage.addChild(bubbles[bubbles.length - 1].sprite)
	}
}

const weeds = [];
for (let index = 0; index < config.weed_count; index++) {
	const weed = new Seaweed()
	weeds.push(weed);
	app.stage.addChild(weed.sprite);
}

function draw(delta) {
	for (let index = bubbles.length - 1; index >= 0; index--) {
		bubbles[index].tick(delta);

		if (bubbles[index].sprite.y < -100) {
			app.stage.removeChild(bubbles[index].sprite)
			bubbles.splice(index, 1);
		}
	}
	for (let index = 0; index < weeds.length; index++) {
		const weed = weeds[index];
		weed.tick(delta);
	}
}

const startTime = Date.now();

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
})

const emoteTextures = {};
const pendingEmoteArray = [];
ChatInstance.on("emotes", (e) => {
	/*
	const output = { emotes: [] };
	for (let index = 0; index < Math.min(7, e.emotes.length); index++) {
		const emote = e.emotes[index];
		if (!emoteTextures[emote.material.id]) {
			emoteTextures[emote.material.id] = new THREE.CanvasTexture(emote.material.canvas);
		}
		emote.texture = emoteTextures[emote.material.id];
		output.emotes.push(emote);
	}
	pendingEmoteArray.push(output);
	*/
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