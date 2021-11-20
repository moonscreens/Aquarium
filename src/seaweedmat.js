import * as THREE from 'three';
import webGLSimplex3DNoise from './simplex3DShaderCode';
import seaWeedURL from "./img/seaweed2x.png";
const seaWeedTexture = new THREE.TextureLoader().load(seaWeedURL);

function generateSeaWeedMat() {

	let lastFrame = Date.now();
	const tick = () => {
		const delta = (Date.now() - lastFrame) / 1000;
		lastFrame = Date.now();
		if (uniforms) {
			uniforms.u_time.value += delta;
		}
		window.requestAnimationFrame(tick);
	}
	let uniforms = null;

	const seaweedMat = new THREE.MeshBasicMaterial({
		map: seaWeedTexture,
		transparent: true,
	});
	seaweedMat.onBeforeCompile = function (shader) {
		shader.uniforms.u_time = { value: Math.random() * 1000 };
		uniforms = shader.uniforms;
		tick();
		shader.vertexShader = `
			uniform float u_time;
			${webGLSimplex3DNoise}
			${shader.vertexShader}`;
		shader.vertexShader = shader.vertexShader.replace(
			'#include <begin_vertex>',
			`
			float bnScale = 0.0003;
	
			vec3 transformed = position + vec3(
				snoiseOffset(vec3(bnScale * 2.0, 0, 0), bnScale * 2.0, 0.2),
				snoiseOffset(vec3(0, bnScale, 0), bnScale, 0.2),
				0.0
			) * 30000.0;
			`,
		);

		seaweedMat.userData.shader = shader;

	};

	// Make sure WebGLRenderer doesn't reuse a single program
	seaweedMat.customProgramCacheKey = function () {
		return parseInt(window.shaderPID++); // some random ish number
	};

	return seaweedMat;
}



export default generateSeaWeedMat;