/**
 * Play Screen
 */
import Phaser from 'phaser';

import Config from '../Config';
import Direction from './Direction';
import GameBoard from './GameBoard';


export default class PlayScreen extends Phaser.Scene {

    constructor() {
        super('PlayScreen');
    }

    create() {
        this.board = new GameBoard(this);
        this.input.keyboard.on('keydown', this.handleKey, this);
        this.input.on('pointerup', this.handleSwipe, this);
    }

    handleKey(e) {
        switch (e.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.move(Direction.LEFT);
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.move(Direction.RIGHT);
                break;
            case 'KeyW':
            case 'ArrowUp':
                this.move(Direction.UP);
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.move(Direction.DOWN);
                break;
            default:
                // do nothing
                break;
        }
    }

    handleSwipe(e) {
        const swipeTime = e.upTime - e.downTime;
        const fastEnough = swipeTime < Config.swipeMaxTime;
        const swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
        const swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
        const longEnough = swipeMagnitude > Config.swipeMinDistance;
        if (longEnough && fastEnough) {
            Phaser.Geom.Point.SetMagnitude(swipe, 1);
            if (swipe.x > Config.swipeMinNormal) {
                this.move(Direction.RIGHT);
            }
            if (swipe.x < -Config.swipeMinNormal) {
                this.move(Direction.LEFT);
            }
            if (swipe.y > Config.swipeMinNormal) {
                this.move(Direction.DOWN);
            }
            if (swipe.y < -Config.swipeMinNormal) {
                this.move(Direction.UP);
            }
        }
    }

    move(direction) {
        if (!this.board.canMove) {
            return;
        }

        this.board.makeMove(direction);
    }
}
