window.addEventListener('DOMContentLoaded', () => {
	const canvas = document.createElement('canvas');
	canvas.classList.add('background-canvas');
	document.body.appendChild(canvas);

	function resize() {
		canvas.width = window.innerWidth * devicePixelRatio;
		canvas.height = window.innerHeight * devicePixelRatio;
		h = gl.drawingBufferHeight;
		w = gl.drawingBufferWidth;
	}
	window.addEventListener('resize', resize);

	let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	var h = gl.drawingBufferHeight;
	var w = gl.drawingBufferWidth;

	let pid = gl.createProgram();
	shader('glsl/vertex', gl.VERTEX_SHADER);
	shader('glsl/fragment', gl.FRAGMENT_SHADER);
	gl.linkProgram(pid);

	if (window.location.hostname.match(/localhost/)) {
		gl.validateProgram(pid);
		if (!gl.getProgramParameter(pid, gl.VALIDATE_STATUS)) {
			console.error('ERROR validating program!', gl.getProgramInfoLog(pid));
		}
	}

	let array = new Float32Array([-1, 3, -1, -1, 3, -1]);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

	let al = gl.getAttribLocation(pid, "coords");
	gl.vertexAttribPointer(al, 2 /*components per vertex */, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(al);

	const timeLocation = gl.getUniformLocation(pid, "u_time");
	const widthLocation = gl.getUniformLocation(pid, "width");
	const heightLocation = gl.getUniformLocation(pid, "height");
	

	function draw(time) {
		window.requestAnimationFrame(draw);
		gl.viewport(0, 0, w, h);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.uniform1f(timeLocation, time / 1000);
		gl.uniform1f(widthLocation, h);
		gl.uniform1f(heightLocation, w);
		gl.useProgram(pid);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}

	function shader(name, type) {
		let src = [].slice.call(document.scripts).find(s => s.type === name).innerText;
		let sid = gl.createShader(type);
		gl.shaderSource(sid, src);
		gl.compileShader(sid);
		if (!gl.getShaderParameter(sid, gl.COMPILE_STATUS)) {
			console.error('ERROR compiling shader!', name, gl.getShaderInfoLog(sid));
		}
		gl.attachShader(pid, sid);
	}


	resize();
	window.requestAnimationFrame(draw);
})