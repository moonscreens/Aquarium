import * as PIXI from 'pixi.js';

const seaweedTexture = PIXI.Texture.from(require('./seaweed2x.png'));

class Seaweed {
    constructor(x = null, y = null) {
        this.sprite = new PIXI.Sprite(seaweedTexture);
        this.sprite.anchor.set(0.5, 0.75)

        this.sprite.x = (Math.random() * window.innerWidth);
        this.sprite.y = 0;
    }

    tick(delta) {
        this.sprite.rotation = Math.sin(Date.now() / 2000 + (this.sprite.x/window.innerWidth)*3)/10;
    }
}

export default Seaweed;