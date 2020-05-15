import * as THREE from 'three';

import Chat from 'twitch-chat';

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
})

const emoteTextures = {};
const pendingEmoteArray = [];
ChatInstance.dispatch = (e)=>{
	const output = {emotes: []};
	for (let index = 0; index < e.emotes.length; index++) {
		const emote = e.emotes[index];
		if (!emoteTextures[emote.material.id]) {
			emoteTextures[emote.material.id] = new THREE.CanvasTexture(emote.material.canvas);
		}
		emote.texture = emoteTextures[emote.material.id];
		output.emotes.push(emote);
	}
	pendingEmoteArray.push(output);
}

const setupEnvironment = require('./environment.js');

const globalConfig = {
	speed: 0.002,
	emoteScale: 1,

	cameraDistance: 35,
	cameraFar: 40,
}

const plane_geometry = new THREE.PlaneBufferGeometry(globalConfig.emoteScale, globalConfig.emoteScale);

const bubble_material = new THREE.MeshPhysicalMaterial( {
	color: 0xffffff,
	metalness: 0.1,
	roughness: 0.15,
	depthWrite: false,
	blending: THREE.AdditiveBlending,
	transparency: 0.01, // use material.transparency for glass materials
	opacity: 1,
	transparent: true
} );
const bubble_geometry = new THREE.SphereBufferGeometry(globalConfig.emoteScale/10, 32, 16);

const getSpawnPosition = () => {
	const side = Math.random() > 0.5 ? -1 : 1;
	return {
		x: globalConfig.cameraDistance*side,
		y: Math.random()*10-5,
		z: Math.random()*globalConfig.cameraDistance/1.25,
		vx: side*-1,
		vy: (Math.random()-0.5)/4,
		vz: (Math.random()-0.5)/2,
		side,
	}
}

window.addEventListener('DOMContentLoaded', () => {
	let camera, scene, renderer;

	const bubbles = [];
	const updateBubbles = (speedTimeRatio) => {
		for (let index = bubbles.length-1; index >= 0; index--) {
			const bubble = bubbles[index];
			bubble.p+=speedTimeRatio*(bubble.r*2-1);
			bubble.mesh.position.y += 0.025*speedTimeRatio;
			bubble.mesh.position.x = bubble.x + (Math.sin(bubble.p/20)/2)*globalConfig.emoteScale*bubble.r2;
			//bubble.mesh.position.z = bubble.z + (Math.cos(bubble.p/20)/2)*globalConfig.emoteScale*bubble.r2;

			if (bubble.mesh.position.y > globalConfig.cameraDistance) {
				scene.remove(bubble.mesh);
				bubbles.splice(index, 1);
			}
		}
	}

	const bt = {}
	const updateBubbleTemplate = () => {
		bt.x = Math.random()*globalConfig.cameraDistance - globalConfig.cameraDistance/2;
		bt.z = Math.random()*globalConfig.cameraDistance;
		bt.y = -globalConfig.cameraDistance;
		bt.spawns = 0;
	}
	updateBubbleTemplate();

	const createBubble = () => {
		if (Math.random() > 0.9 || bt.spawns > 12) {
			updateBubbleTemplate();
		}
		const bubble = new THREE.Mesh(bubble_geometry, bubble_material);
		scene.add(bubble);

		const x = bt.x;
		const z = bt.z;
		const y = bt.y;
		bt.spawns++;

		bubble.position.x = x;
		bubble.position.z = z;
		bubble.position.y = y;

		const scale = 1/(bt.spawns/2+0.5);
		bubble.scale.x = scale;
		bubble.scale.y = scale;
		bubble.scale.z = scale;

		bubbles.push({
			mesh: bubble,
			p: Math.random(),
			r: Math.random(),
			r2: Math.random(),
			x,
			y,
			z,
		})
	}

	init();
	draw();

	function init() {
		camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, globalConfig.cameraFar);
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = globalConfig.cameraDistance;
		camera.lookAt(0, 0, 0);

		scene = new THREE.Scene();
		setupEnvironment(scene, globalConfig);

		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.shadowMap.enabled = true;
		renderer.setSize(window.innerWidth, window.innerHeight);
		window.addEventListener('resize', () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		})
		document.body.appendChild(renderer.domElement);
	}

	let lastFrame = Date.now();
	function draw() {
		requestAnimationFrame(draw);

		for (const key in emoteTextures) {
			if (emoteTextures.hasOwnProperty(key)) {
				const element = emoteTextures[key];
				element.needsUpdate = true;
			}
		}

		if (Math.random() > 0.9) {
			createBubble();
		}
		const speedTimeRatio = (Date.now() - lastFrame) / 16;
		updateBubbles(speedTimeRatio);
		lastFrame = Date.now();

		for (let index = 0; index < pendingEmoteArray.length; index++) {
			const emotes = pendingEmoteArray[index];

			if (!emotes.group) {
				emotes.group = new THREE.Group();
				const position = getSpawnPosition(globalConfig.emoteSpawnRatio);
				emotes.pos = position;
				emotes.group.position.x = position.x;
				emotes.group.position.y = position.y;
				emotes.group.position.z = position.z;

				if (position.side < 0) {
					emotes.group.rotation.y = Math.PI;
				}
				emotes.initGroup = true;
			}

			const ratio = 0.035*speedTimeRatio;
			emotes.group.position.x += emotes.pos.vx*ratio;
			emotes.group.position.y += emotes.pos.vy*ratio;
			//emotes.group.position.z += emotes.pos.vz*ratio;

			if (
				emotes.group.position.x > globalConfig.cameraDistance*2 || 
				emotes.group.position.x < globalConfig.cameraDistance*-2 || 
				emotes.group.position.y > globalConfig.cameraDistance*2) {
				for (let i = 0; i < emotes.emotes.length; i++) {
					const emote = emotes.emotes[i];
					emotes.group.remove(emote.sprite);
				}
				scene.remove(emotes.group);
				pendingEmoteArray.splice(index, 1);
			} else {
				emotes.progress += globalConfig.speed*globalConfig.emoteSpeedRatio*speedTimeRatio;

				for (let i = 0; i < emotes.emotes.length; i++) {
					const emote = emotes.emotes[i];

					if (emote && !emote.sprite) {
						emote.sprite = new THREE.Mesh(plane_geometry, new THREE.MeshBasicMaterial({ map: emote.texture, transparent: true, side: THREE.DoubleSide }));
						emote.sprite.position.x += i * globalConfig.emoteScale;
						emotes.group.add(emote.sprite);
					}
					if (emote && emote.sprite) {
						emote.sprite.material.needsUpdate = true;
					}
				}

				if (emotes.initGroup) {
					emotes.initGroup = false;
					scene.add(emotes.group);
				}
			}
		}

		renderer.render(scene, camera);
	}
})