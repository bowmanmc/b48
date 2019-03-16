/**
 * Play Screen
 */
import Phaser from 'phaser';

import Config from '../Config';

const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;

export default class PlayScreen extends Phaser.Scene {

    constructor() {
        super('PlayScreen');
    }

    create() {
        this.canMove = false;
        this.boardArray = [];
        const {rows, columns} = Config.board;
        const tileSize = this.getTileSize();

        for (let i = 0; i < rows; i++) {
            this.boardArray[i] = [];
            for (let j = 0; j < columns; j++) {
                const pos = this.getTilePosition(i, j);
                const tileBg = this.add.image(pos.x, pos.y, 'tile-empty');
                tileBg.setDisplaySize(tileSize, tileSize);

                const tile = this.add.sprite(pos.x, pos.y, 'tiles', 3);
                tile.setDisplaySize(tileSize, tileSize);
                tile.visible = false;
                this.boardArray[i][j] = {
                    tileValue: 0,
                    tileSprite: tile,
                    upgraded: false
                };
            }
        }

        this.addTile();
        this.addTile();

        this.input.keyboard.on('keydown', this.handleKey, this);
        this.input.on('pointerup', this.handleSwipe, this);
    }

    handleKey(e) {
        if (!this.canMove) {
            return;
        }

        switch (e.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.makeMove(LEFT);
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.makeMove(RIGHT);
                break;
            case 'KeyW':
            case 'ArrowUp':
                this.makeMove(UP);
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.makeMove(DOWN);
                break;
            default:
                // do nothing
                break;
        }
    }

    handleSwipe(e) {
        if (!this.canMove) {
            return;
        }
        const swipeTime = e.upTime - e.downTime;
        const fastEnough = swipeTime < Config.swipeMaxTime;
        const swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
        const swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
        const longEnough = swipeMagnitude > Config.swipeMinDistance;
        if (longEnough && fastEnough) {
            Phaser.Geom.Point.SetMagnitude(swipe, 1);
            if (swipe.x > Config.swipeMinNormal) {
                this.makeMove(RIGHT);
            }
            if (swipe.x < -Config.swipeMinNormal) {
                this.makeMove(LEFT);
            }
            if (swipe.y > Config.swipeMinNormal) {
                this.makeMove(DOWN);
            }
            if (swipe.y < -Config.swipeMinNormal) {
                this.makeMove(UP);
            }
        }
    }

    makeMove(d) {
        this.movingTiles = 0;
        const dRow = (d === LEFT || d === RIGHT) ? 0 : d === UP ? -1 : 1;
        const dCol = (d === UP || d === DOWN) ? 0 : d === LEFT ? -1 : 1;
        this.canMove = false;
        const firstRow = (d === UP) ? 1 : 0;
        const lastRow = Config.board.rows - ((d === DOWN) ? 1 : 0);
        const firstCol = (d === LEFT) ? 1 : 0;
        const lastCol = Config.board.columns - ((d === RIGHT) ? 1 : 0);
        for (let i = firstRow; i < lastRow; i++) {
            for (let j = firstCol; j < lastCol; j++) {
                const curRow = dRow === 1 ? (lastRow - 1) - i : i;
                const curCol = dCol === 1 ? (lastCol - 1) - j : j;
                const tileValue = this.boardArray[curRow][curCol].tileValue;
                if (tileValue !== 0) {
                    let newRow = curRow;
                    let newCol = curCol;
                    while (this.isLegalPosition(newRow + dRow, newCol + dCol, tileValue)) {
                        newRow += dRow;
                        newCol += dCol;
                    }
                    if (newRow !== curRow || newCol !== curCol) {
                        const newPos = this.getTilePosition(newRow, newCol);
                        const willUpdate = this.boardArray[newRow][newCol].tileValue === tileValue;
                        this.moveTile(this.boardArray[curRow][curCol].tileSprite, newPos, willUpdate);
                        this.boardArray[curRow][curCol].tileValue = 0;
                        if (willUpdate) {
                            this.boardArray[newRow][newCol].tileValue++;
                            this.boardArray[newRow][newCol].upgraded = true;
                            // this.boardArray[curRow][curCol].tileSprite.setFrame(tileValue);
                        } else {
                            this.boardArray[newRow][newCol].tileValue = tileValue;
                        }
                    }
                }
            }
        }
        if (this.movingTiles === 0) {
            this.canMove = true;
        }
    }

    moveTile(tile, point, upgrade) {
        this.movingTiles++;
        tile.depth = this.movingTiles;
        //const distance = Math.abs(tile.x - point.x) + Math.abs(tile.y - point.y);
        //const tileSize = this.getTileSize();
        this.tweens.add({
            targets: [tile],
            x: point.x,
            y: point.y,
            //duration: Config.tweenSpeed * distance / tileSize,
            duration: Config.tweenSpeed,
            callbackScope: this,
            onComplete: function () {
                if (upgrade) {
                    this.upgradeTile(tile);
                } else {
                    this.endTween(tile);
                }
            }
        });
    }

    upgradeTile(tile) {
        tile.setFrame(tile.frame.name + 1);
        this.tweens.add({
            targets: [tile],
            ease: 'Elastic',
            scaleX: 0.5,
            scaleY: 0.5,
            yoyo: true,
            duration: Config.tweenSpeed / 2,
            callbackScope: this,
            onComplete: function () {
                this.endTween(tile);
            }
        });
    }

    endTween(tile) {
        this.movingTiles--;
        tile.depth = 0;
        if (this.movingTiles === 0) {
            this.refreshBoard();
        }
    }

    refreshBoard() {
        for (let i = 0; i < Config.board.rows; i++) {
            for (let j = 0; j < Config.board.columns; j++) {
                const spritePosition = this.getTilePosition(i, j);
                this.boardArray[i][j].tileSprite.x = spritePosition.x;
                this.boardArray[i][j].tileSprite.y = spritePosition.y;
                const tileValue = this.boardArray[i][j].tileValue;
                if (tileValue > 0) {
                    this.boardArray[i][j].tileSprite.visible = true;
                    this.boardArray[i][j].tileSprite.setFrame(tileValue - 1);
                    this.boardArray[i][j].upgraded = false;
                } else {
                    this.boardArray[i][j].tileSprite.visible = false;
                }
            }
        }
        this.addTile();
    }

    isLegalPosition(row, col, value) {
        const rowInside = row >= 0 && row < Config.board.rows;
        const colInside = col >= 0 && col < Config.board.columns;
        if (!rowInside || !colInside) {
            return false;
        }
        const emptySpot = this.boardArray[row][col].tileValue === 0;
        const sameValue = this.boardArray[row][col].tileValue === value;
        const alreadyUpgraded = this.boardArray[row][col].upgraded;
        return emptySpot || (sameValue && !alreadyUpgraded);
    }


    addTile() {
        const {rows, columns} = Config.board;
        let emptyTiles = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (this.boardArray[i][j].tileValue === 0) {
                    emptyTiles.push({row: i, col: j});
                }
            }
        }

        if (emptyTiles.length > 0) {
            let chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);
            let tile = this.boardArray[chosenTile.row][chosenTile.col];
            tile.tileValue = 1;
            tile.tileSprite.visible = true;
            tile.tileSprite.setFrame(0);
            tile.tileSprite.alpha = 0;
            this.tweens.add({
                targets: [tile.tileSprite],
                alpha: 1,
                duration: Config.tweenSpeed,
                callbackScope: this,
                onComplete: function () {
                    this.canMove = true;
                }
            });
        }
    }

    getTileSize() {
        const {width, board} = Config;
        const {columns, tileSpacing} = board;

        const tileSize = (width - (columns + 1) * tileSpacing) / columns;
        return tileSize;
    }

    getTilePosition(row, col) {
        const tileSize = this.getTileSize();
        const {marginTop, tileSpacing} = Config.board;

        const posX = (tileSize / 2) + col * tileSize + ((col + 1) * tileSpacing);
        const posY = marginTop + (tileSize / 2) + row * tileSize + ((row + 1) * tileSpacing);
        return new Phaser.Geom.Point(posX, posY);
    }
}
