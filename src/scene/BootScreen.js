/**
 * Boot Screen
 */
import Phaser from 'phaser';


export default class BootScreen extends Phaser.Scene {

    constructor() {
        super('BootScreen');
    }

    preload() {
        this.load.image('tile-empty', 'images/tile-empty.png');
        this.load.spritesheet('tiles', 'images/tiles.png', {
            frameWidth: 256, frameHeight: 256
        });
    }

    create() {
        this.scene.start('PlayScreen');
    }
}
