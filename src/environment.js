import * as THREE from 'three';

module.exports = (scene, globalConfig) => {
	scene.background = new THREE.Color(0x003030);
	scene.fog = new THREE.Fog(0x003030, globalConfig.cameraDistance/4, globalConfig.cameraDistance);


	const ambiLight = new THREE.AmbientLight(0x222222);
	scene.add(ambiLight);

	const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
	directionalLight.castShadow = true;

	/*directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;*/

	const d = 50;

	directionalLight.shadow.camera.left = - d;
	directionalLight.shadow.camera.right = d;
	directionalLight.shadow.camera.top = d;
	directionalLight.shadow.camera.bottom = - d;

	directionalLight.shadow.camera.far = 1000;

	scene.add(directionalLight);

	for (let x = 0; x < 10; x++) {
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
	}

}