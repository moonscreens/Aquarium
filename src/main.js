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
	// If using planes, consider using MeshBasicMaterial instead of SpriteMaterial
	materialType: THREE.SpriteMaterial,

	// Passed to material options
	materialOptions: {
		transparent: true,
	},

	channels,
	maximumEmoteLimit: 3,
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
		element.position.addScaledVector(element.velocity, delta);
		if (element.timestamp + element.lifespan < Date.now()) {
			sceneEmoteArray.splice(index, 1);
			scene.remove(element);
		} else {
			element.update();
		}
	}
	lastFrame = Date.now();

	renderer.render(scene, camera);
	if (query_vars.stats) stats.end();
};


/*
** Handle Twitch Chat Emotes
*/
const sceneEmoteArray = [];
ChatInstance.listen((emotes) => {
	const group = new THREE.Group();
	group.lifespan = 15000;
	group.timestamp = Date.now();

	let i = 0;
	emotes.forEach((emote) => {
		const sprite = new THREE.Sprite(emote.material);
		sprite.position.x = i;
		group.add(sprite);
		i++;
	})

	// Set velocity to a random normalized value
	group.velocity = new THREE.Vector3(
		0,
		2,
		0
	);
	group.position.x = (Math.random() * 2 - 1) * 13;
	group.position.z = Math.random() * -10;
	group.position.y = -8 + group.position.z * 0.6;
	const originPos = group.position.clone();


	group.update = () => { // called every frame
		group.position.x = originPos.x + Math.sin((Date.now() + group.timestamp) / 1000);
	}

	scene.add(group);
	sceneEmoteArray.push(group);
});


/*
** Image layers
*/

scene.fog = new THREE.Fog(0x09356b, 10, 20);

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

for (let index = 0; index < 20; index++) {
	const seaWeed = new THREE.Mesh(new THREE.PlaneGeometry(389, 8924, 128, 128), seaWeedMat());
	seaWeed.scale.setScalar(0.002);
	seaWeed.position.z = -10 * Math.random();
	seaWeed.position.y = (-Math.random() * 10 - 1) + seaWeed.position.z * 0.6;
	seaWeed.position.x = (Math.random() * 2 - 1) * 13;
	scene.add(seaWeed);
}