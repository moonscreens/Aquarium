import TwitchChat from "twitch-chat-emotes-threejs";
import * as THREE from "three";
import "./main.css";

window.shaderPID = 100;

/*
** connect to twitch chat
*/

// a default array of twitch channels to join
let channels = ['moonmoon'];

// the following few lines of code will allow you to add ?channels=channel1,channel2,channel3 to the URL in order to override the default array of channels
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});

if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}

const ChatInstance = new TwitchChat({
	THREE,
	materialType: THREE.MeshBasicMaterial,

	// Passed to material options
	materialOptions: {
		transparent: true,
	},

	channels,
	maximumEmoteLimit: 4,
	duplicateEmoteLimit: 3,
})

/*
** Initiate ThreejS scene
*/

const camera = new THREE.PerspectiveCamera(
	70,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 10;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('resize', resize);
	if (query_vars.stats) document.body.appendChild(stats.dom);
	document.body.appendChild(renderer.domElement);
	draw();
})

/*
** Draw loop
*/
let lastFrame = Date.now();
function draw() {
	if (query_vars.stats) stats.begin();
	requestAnimationFrame(draw);
	const delta = (Date.now() - lastFrame) / 1000;


	for (let index = sceneEmoteArray.length - 1; index >= 0; index--) {
		const element = sceneEmoteArray[index];
		element.position.y += delta * 2;
		if (element.timestamp + element.lifespan < Date.now()) {
			sceneEmoteArray.splice(index, 1);
			scene.remove(element);
		} else {
			if (element.children.length > 1) {
				element.children.forEach((child) => {
					const time = (Date.now() + element.timestamp) / 500;
					child.position.x = Math.sin(time + (Math.PI * 0.5) * child.position.y) * 0.5;
					child.rotation.z = Math.sin(time + (Math.PI * 0.5) * child.position.y + (Math.PI * -0.5)) * 0.5 - (Math.PI * 0.5);
				})
			}
		}
	}
	lastFrame = Date.now();

	for (let index = 0; index < bubbles.length; index++) {
		const group = bubbles[index];
		group.position.y += delta * 2;
		if (group.position.y > 10) {
			group.ResetPosition();
		}
		for (let i = 0; i < group.children.length; i++) {
			const bubble = group.children[i];
			bubble.position.x = Math.cos((group.random + Date.now()) / 400 + i) * 0.5;
		}
	}


	try {
		if (Eel.active) {
			eelContext.clearRect(0, 0, eelCanvas.width, eelCanvas.height);
			eelFrame += delta * 10;
			while (eelFrame >= eelFrames.length) {
				eelFrame -= eelFrames.length;
			}
			eelContext.drawImage(eelFrames[Math.floor(eelFrame)], 0, 0);
			eelTexture.needsUpdate = true;

			const p = (Date.now() - Eel.timestamp) / Eel.lifespan;
			const destination = 10;
			if (p < 0.25) {
				Eel.position.x = -destination + easeInOut(p / 0.25) * destination;
			} else if (p > 0.75) {
				Eel.position.x = -destination + easeInOut(1 - (p - 0.75) / 0.25) * destination;
			} else {
				Eel.position.x = -destination + destination;
			}

		} else {
			Eel.position.x = -10;
		}
	} catch (e) { }

	renderer.render(scene, camera);
	if (query_vars.stats) stats.end();
};

const easeInOut = (t) => {
	return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}


/*
** Handle Twitch Chat Emotes
*/
const sceneEmoteArray = [];
const emoteGeometry = new THREE.PlaneBufferGeometry(1, 1);
ChatInstance.listen((emotes) => {
	const group = new THREE.Group();
	group.lifespan = 15000;
	group.timestamp = Date.now();

	for (let i = 0; i < emotes.length; i++) {
		const emote = emotes[i];
		const sprite = new THREE.Mesh(emoteGeometry, emote.material);
		sprite.position.y = (emotes.length - i) * 0.9;
		group.add(sprite);
	}

	// Set velocity to a random normalized value
	group.velocity = new THREE.Vector3(
		0,
		2,
		0
	);
	group.position.x = (Math.random() * 2 - 1) * 13;
	group.position.z = Math.random() * -7;
	group.position.y = -8 + group.position.z * 0.6;

	scene.add(group);
	sceneEmoteArray.push(group);
});

const bubbles = [];
import bubbleTextureUrl from "./img/bubble.png";
const bubbleMaterial = new THREE.SpriteMaterial({
	map: new THREE.TextureLoader().load(bubbleTextureUrl),
	transparent: true,
	blending: THREE.AdditiveBlending,
});
for (let index = 0; index < 100; index++) {
	const group = new THREE.Group();
	group.ResetPosition = () => {
		group.position.x = (Math.random() * 2 - 1) * 19;
		group.position.z = Math.random() * -10;
		group.position.y = -15 + Math.random() * -10;
	}
	group.random = Math.random() * 10000;

	const r = Math.ceil(Math.random() * 10);
	for (let i = 0; i < r; i++) {
		const sprite = new THREE.Sprite(bubbleMaterial);
		sprite.position.y = i * 0.5;
		sprite.scale.setScalar(i / r / 3);
		group.add(sprite);
	}
	group.ResetPosition();
	group.position.y = Math.random() * -20;
	bubbles.push(group);
	scene.add(group);
}


/*
** Image layers
*/

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(-0.1, 1, 0);
scene.add(sunLight);

scene.fog = new THREE.Fog(0x167bff, 7, 20);

import layer0Url from "./img/layer0.png";
import layer1Url from "./img/layer1.png";
import layer2Url from "./img/layer2.png";
import layer3Url from "./img/layer3.png";

const urls = [layer0Url, layer1Url, layer2Url, layer3Url];
const planes = [];

for (let index = 0; index < urls.length; index++) {
	const mat = new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load(urls[index]),
		transparent: true,
	});
	const plane = new THREE.Mesh(new THREE.PlaneGeometry(2048, 1024), mat);
	plane.scale.setScalar(0.01216);
	plane.position.y = -1;
	scene.add(plane);
	planes.push(plane);
}

planes[0].position.z = -4;
planes[0].scale.multiplyScalar(1.4);
planes[0].position.y = -1.36;

planes[2].position.z = 0.01;


planes[3].position.z = 2;
planes[3].scale.setScalar(0.0098);
planes[3].position.y += 0.4;


/*
** seaweed
*/

import seaWeedMat from "./seaweedmat";
const seaWeedMats = Array(5);
for (let index = 0; index < seaWeedMats.length; index++) {
	seaWeedMats[index] = seaWeedMat();
}

for (let index = 0; index < 100; index++) {
	const seaWeed = new THREE.Mesh(new THREE.PlaneGeometry(389, 8924, 4, 16), seaWeedMats[Math.floor(Math.random() * seaWeedMats.length)]);
	seaWeed.scale.setScalar(0.002);
	const r = Math.random();
	seaWeed.position.z = -10 * (1 - r) - 2.5;
	seaWeed.position.y = (-Math.random() * 10 - 1) + seaWeed.position.z * 0.6;
	seaWeed.position.x = (Math.random() * 2 - 1) * 20;
	scene.add(seaWeed);
}

/*
** Eel
*/

// Webpack file loader being annoying, import using AI generated lengthy code because I'm lazy 😎
import eel1Url from "./img/eel/eel_1.png";
import eel2Url from "./img/eel/eel_2.png";
import eel3Url from "./img/eel/eel_3.png";
import eel4Url from "./img/eel/eel_4.png";
import eel5Url from "./img/eel/eel_5.png";
import eel6Url from "./img/eel/eel_6.png";
import eel7Url from "./img/eel/eel_7.png";
import eel8Url from "./img/eel/eel_8.png";
import eel9Url from "./img/eel/eel_9.png";
import eel10Url from "./img/eel/eel_10.png";
import eel11Url from "./img/eel/eel_11.png";
import eel12Url from "./img/eel/eel_12.png";
import eel13Url from "./img/eel/eel_13.png";
import eel14Url from "./img/eel/eel_14.png";
import eel15Url from "./img/eel/eel_15.png";
import eel16Url from "./img/eel/eel_16.png";
import eel17Url from "./img/eel/eel_17.png";
import eel18Url from "./img/eel/eel_18.png";
import eel19Url from "./img/eel/eel_19.png";
import eel20Url from "./img/eel/eel_20.png";

const eelFrames = [
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
	new Image(),
];

eelFrames[0].src = eel1Url;
eelFrames[1].src = eel2Url;
eelFrames[2].src = eel3Url;
eelFrames[3].src = eel4Url;
eelFrames[4].src = eel5Url;
eelFrames[5].src = eel6Url;
eelFrames[6].src = eel7Url;
eelFrames[7].src = eel8Url;
eelFrames[8].src = eel9Url;
eelFrames[9].src = eel10Url;
eelFrames[10].src = eel11Url;
eelFrames[11].src = eel12Url;
eelFrames[12].src = eel13Url;
eelFrames[13].src = eel14Url;
eelFrames[14].src = eel15Url;
eelFrames[15].src = eel16Url;
eelFrames[16].src = eel17Url;
eelFrames[17].src = eel18Url;
eelFrames[18].src = eel19Url;
eelFrames[19].src = eel20Url;

const eelCanvas = document.createElement("canvas");
eelCanvas.width = 1024;
eelCanvas.height = 512;
const eelContext = eelCanvas.getContext("2d");

const eelTexture = new THREE.CanvasTexture(eelCanvas);
const Eel = new THREE.Mesh(
	new THREE.PlaneGeometry(eelCanvas.width, eelCanvas.height),
	new THREE.MeshBasicMaterial({
		map: eelTexture,
		transparent: true,
	}),
);
const EelGroup = new THREE.Group();
EelGroup.add(Eel);


function EelRight() {
	Eel.scale.setScalar(0.009);
	EelGroup.position.x = 8;
	EelGroup.position.y = -4.5;
	EelGroup.position.z = -1;
	EelGroup.scale.x = -1;
	EelGroup.rotation.z = Math.PI * -0.15;
}
function EelLeft() {
	Eel.scale.setScalar(0.005);
	EelGroup.position.x = -9;
	EelGroup.position.y = -4;
	EelGroup.position.z = 0;
	EelGroup.rotation.z = Math.PI * 0.15;
	EelGroup.scale.x = 1;
}

scene.add(EelGroup);

let eelFrame = 0;
EelLeft();
Eel.timestamp = Date.now()
Eel.lifespan = 10000;

function triggerEel() {
	if (Math.random() < 0.5) EelLeft();
	else EelRight();
	Eel.active = true;
	Eel.timestamp = Date.now();
	setTimeout(() => {
		Eel.active = false;
	}, Eel.lifespan);
}
triggerEel();
setInterval(triggerEel, 11000);