import * as PIXI from 'pixi.js'

const bubbleTexture = PIXI.Texture.from(require('./bubble.png'));

class Bubble {
	constructor(x = null, y = null, scale = 1) {
		this.sprite = new PIXI.Sprite(bubbleTexture);

		if (x === null) this.sprite.x = (Math.random() * window.innerWidth);
		else this.sprite.x = x;
		if (y === null) this.sprite.y = window.innerHeight;
		else this.sprite.y = y;

		this.sprite.scale.x = scale;
		this.sprite.scale.y = scale;

		this.speedScale = Math.random()/2 + 0.75

		this.random = Math.random();
		this.r2 = Date.now() * Math.random();
		this.lastFrame = Date.now();
	}

	tick(delta) {
		this.sprite.y -= delta * 2 * this.speedScale;
		this.sprite.x += Math.sin((Date.now() + this.r2) / 700) * this.sprite.scale.x;
	}
}

export default Bubble;