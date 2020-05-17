import * as THREE from 'three';

const layerimages = [
	require('./layer1.png'),
	require('./layer2.png'),
	require('./layer3.png'),
	require('./layer4.png'),
	require('./layer5.png'),
]

const planeGeometry = new THREE.PlaneBufferGeometry(1.777777777777778, 1);
const newPlaneImage = (url, options = {}) => {
	options = Object.assign({
		zpos: 10,
		scale: 21,
	}, options);
	const mesh = new THREE.Mesh(
		planeGeometry,
		(typeof url !== "string") ? new THREE.MeshBasicMaterial({
			map: url,
			transparent: true,
		}) : new THREE.MeshBasicMaterial({
			map: new THREE.TextureLoader().load(url),
			transparent: true,
		})
	);

	mesh.position.z = options.zpos;

	mesh.scale.x = options.scale;
	mesh.scale.y = options.scale;

	return mesh;
}

module.exports = (scene, globalConfig) => {
	scene.background = new THREE.Color(0x167BFF);
	scene.fog = new THREE.Fog(0x167BFF, globalConfig.cameraDistance / 4, globalConfig.cameraDistance * 1.25);


	const ambiLight = new THREE.AmbientLight(0x222222);
	scene.add(ambiLight);

	const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
	//directionalLight.castShadow = true;

	/*directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;*/

	//const d = 50;

	/*directionalLight.shadow.camera.left = - d;
	directionalLight.shadow.camera.right = d;
	directionalLight.shadow.camera.top = d;
	directionalLight.shadow.camera.bottom = - d;

	directionalLight.shadow.camera.far = 1000;*/

	scene.add(directionalLight);


	const layerOffset = 0.01;
	const layer1 = newPlaneImage(layerimages[0], {
		zpos: 27,
		scale: 11.2,
	});
	layer1.position.z -= (layerOffset * 0);
	scene.add(layer1);

	const layer3 = newPlaneImage(layerimages[2], {
		zpos: 19,
		scale: 22.45,
	});
	layer3.position.z -= (layerOffset * 1);
	scene.add(layer3);

	const eelTextureMax = Math.max(
		globalConfig.eelTexture.image.width,
		globalConfig.eelTexture.image.height
	)
	const eelLayer = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(globalConfig.eelTexture.image.width / eelTextureMax, globalConfig.eelTexture.image.height / eelTextureMax),
		new THREE.MeshBasicMaterial({
			map: globalConfig.eelTexture,
			transparent: true,
		})
	)
	eelLayer.scale.x = 10;
	eelLayer.scale.y = 10;
	eelLayer.position.x = -14;
	eelLayer.position.y = -7.25;
	eelLayer.position.z = 19;
	eelLayer.position.z -= (layerOffset * 2);
	scene.add(eelLayer);

	const layer2 = newPlaneImage(layerimages[1], {
		zpos: 19,
		scale: 22.45,
	});
	layer2.position.z -= (layerOffset * 3);
	scene.add(layer2);

	const layer4 = newPlaneImage(layerimages[3], {
		zpos: 19,
		scale: 22.45,
	});
	layer4.position.z -= (layerOffset * 4);
	scene.add(layer4);

	const layer5 = newPlaneImage(layerimages[4], {
		zpos: 10,
		scale: 35,
	});
	layer5.position.z -= (layerOffset * 4);
	scene.add(layer5);

	/*for (let x = 0; x < 10; x++) {
		for (let y = 0; y < 10; y++) {
			for (let z = 0; z < 10; z++) {

				const geometry = new THREE.BoxGeometry();
				const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
				const cube = new THREE.Mesh(geometry, material);

				cube.castShadow = true;
				cube.receiveShadow = true;

				cube.position.x = x * 2 - 10;
				cube.position.y = y * 2 - 20;
				cube.position.z = z * 2 - 10;

				scene.add(cube);
			}
		}
	}*/

}