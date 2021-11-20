import * as THREE from 'three';
import webGLSimplex3DNoise from './simplex3DShaderCode';
import seaWeedURL from "./img/seaweed2x.png";

const matUniforms = {
	u_time: { value: 0 },
}

let lastFrame = Date.now();
const tick = () => {
	const delta = (Date.now() - lastFrame) / 1000;
	lastFrame = Date.now();
	matUniforms.u_time.value += delta;
	window.requestAnimationFrame(tick);
}
tick();


const seaweedMat = new THREE.MeshBasicMaterial({
	map: new THREE.TextureLoader().load(seaWeedURL),
	transparent: true,
});
seaweedMat.onBeforeCompile = function (shader) {
	shader.uniforms.u_time = matUniforms.u_time;
	shader.vertexShader = `
		uniform float u_time;
		${webGLSimplex3DNoise}
		${shader.vertexShader}`;
	shader.vertexShader = shader.vertexShader.replace(
		'#include <begin_vertex>',
		`
		float bnScale = 0.7;
		float baseNoise = snoise(vec3(position.x * bnScale + ${Math.random() * 100}, position.y * bnScale, position.z * bnScale));
		float noise = snoise(vec3(position.x + u_time * 0.005, position.y, position.z));
		float rootNoise = snoise(vec3(position.x, position.y, position.z)) * PI;
		vec3 angle = vec3(sin(rootNoise), cos(rootNoise), 0.0);
		vec3 transformed = position + (angle * noise * 0.1) + (baseNoise * 0.4 * vec3(sin(baseNoise * PI), cos(baseNoise * PI), cos(baseNoise * PI))) * 1000.0;
		`,
	);

	seaweedMat.userData.shader = shader;

};

// Make sure WebGLRenderer doesn't reuse a single program
seaweedMat.customProgramCacheKey = function () {
	return parseInt(window.shaderPID++); // some random ish number
};

export default seaweedMat;