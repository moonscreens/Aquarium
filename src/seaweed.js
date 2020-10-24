import * as PIXI from 'pixi.js';

const image = new Image();
image.addEventListener('load', () => {
    canvas.height = innerHeight * 2;
    canvas.width = (innerHeight / image.height) * image.width * 2;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    seaweedTexture.update();
})
image.src = require('./seaweed2x.png');

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const seaweedTexture = PIXI.Texture.from(canvas);

const weeds = [];

class Seaweed {
    constructor(x = null, y = null) {
        this.sprite = new PIXI.Sprite(seaweedTexture);
        this.sprite.anchor.set(0.5, 0.75);

        this.sprite.x = (Math.random() * window.innerWidth);
        this.sprite.y = 0;
        weeds.push(this);
    }

    updateHeight () {
        this.sprite.height = window.innerHeight / 2;
        this.sprite.width = (window.innerHeight / canvas.height) * canvas.width / 2
    }

    tick(delta) {
        this.sprite.rotation = Math.sin(Date.now() / 2000 + (this.sprite.x / window.innerWidth) * 3) / 20;
    }
}

export default Seaweed;