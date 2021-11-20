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
	materialType: THREE.MeshBasicMaterial,

	// Passed to material options
	materialOptions: {
		transparent: true,
	},

	channels,
	maximumEmoteLimit: 3,
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

	renderer.render(scene, camera);
	if (query_vars.stats) stats.end();
};


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


planes[3].position.z = 2;
planes[3].scale.setScalar(0.0098);
planes[3].position.y += 0.4;


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