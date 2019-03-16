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
            frameWidth: 200, frameHeight: 200
        });
    }

    create() {
        this.scene.start('PlayScreen');
    }
}
