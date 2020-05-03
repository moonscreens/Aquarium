import * as THREE from 'three';

const chatIntegration = require('./chat.js');
const setupEnvironment = require('./environment.js');

const globalConfig = {
	speed: 0.002,
	emoteScale: 1,

	cameraDistance: 25,
	cameraFar: 30,
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
		z: Math.random()*globalConfig.cameraDistance/2 + globalConfig.cameraDistance/4,
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
		for (let index = 0; index < bubbles.length; index++) {
			const bubble = bubbles[index];
			bubble.p+=speedTimeRatio*bubble.r;
			bubble.mesh.position.y += 0.025*speedTimeRatio;
			bubble.mesh.position.x = bubble.x + (Math.sin(bubble.p/20)/2)*globalConfig.emoteScale;

		}
	}
	setInterval(()=>{
		bubbles.push(createBubble());
	}, 250)

	const bt = {}
	const updateBubbleTemplate = () => {
		bt.x = Math.random()*globalConfig.cameraDistance - globalConfig.cameraDistance/2;
		bt.z = Math.random()*globalConfig.cameraDistance;
		bt.y = -globalConfig.cameraDistance;
		bt.spawns = 0;
	}
	updateBubbleTemplate();
	setInterval(updateBubbleTemplate, 1000);

	const createBubble = () => {
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

		return {
			mesh: bubble,
			p: Math.random(),
			r: Math.random(),
			x,
			y,
			z,
		}
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
		const speedTimeRatio = (Date.now() - lastFrame) / 16;
		updateBubbles(speedTimeRatio);
		lastFrame = Date.now();

		for (let index = 0; index < chatIntegration.emotes.length; index++) {
			const emotes = chatIntegration.emotes[index];

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
			emotes.group.position.z += emotes.pos.vz*ratio;

			if (
				emotes.group.position.x > globalConfig.cameraDistance*2 || 
				emotes.group.position.x < globalConfig.cameraDistance*-2 || 
				emotes.group.position.y > globalConfig.cameraDistance*2) {
				for (let i = 0; i < emotes.emotes.length; i++) {
					const emote = emotes.emotes[i];
					emotes.group.remove(emote.sprite);
				}
				scene.remove(emotes.group);
				chatIntegration.emotes.splice(index, 1);
			} else {
				emotes.progress += globalConfig.speed*globalConfig.emoteSpeedRatio*speedTimeRatio;

				for (let i = 0; i < emotes.emotes.length; i++) {
					const emote = emotes.emotes[i];
					if (emote && !emote.sprite) {
						emote.sprite = new THREE.Mesh(plane_geometry, new THREE.MeshBasicMaterial({ map: emote.material.texture, transparent: true, side: THREE.DoubleSide }));
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