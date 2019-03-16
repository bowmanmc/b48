import Phaser from "phaser";

import Config from '../Config';
import Direction from './Direction';


export default class GameBoard {

    constructor(screen) {
        this.screen = screen;
        this.canMove = false;
        this.board = [];

        const {rows, columns} = Config.board;
        const tileSize = this.getTileSize();

        for (let i = 0; i < rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < columns; j++) {
                const pos = this.getTilePosition(i, j);
                const tileBg = this.screen.add.sprite(pos.x, pos.y, 'tiles', 0);
                tileBg.setDisplaySize(tileSize, tileSize);

                const tile = this.screen.add.sprite(pos.x, pos.y, 'tiles', 0);
                tile.setDisplaySize(tileSize, tileSize);
                tile.visible = false;
                this.board[i][j] = {
                    value: 0,
                    sprite: tile,
                    upgraded: false
                };
            }
        }
        // Add the first two tiles to the board
        this.addTile();
        this.addTile();
    }

    addTile() {
        const {rows, columns} = Config.board;
        let emptyTiles = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (this.board[i][j].value === 0) {
                    emptyTiles.push({row: i, col: j});
                }
            }
        }

        if (emptyTiles.length > 0) {
            let chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);
            let tile = this.board[chosenTile.row][chosenTile.col];
            tile.value = 1;
            tile.sprite.visible = true;
            tile.sprite.setFrame(1);
            tile.sprite.alpha = 0;
            this.screen.tweens.add({
                targets: [tile.sprite],
                alpha: 1,
                duration: Config.tweenSpeed,
                callbackScope: this,
                onComplete: function () {
                    this.canMove = true;
                }
            });
        }
    }

    endTween(tile) {
        this.movingTiles--;
        tile.depth = 0;
        if (this.movingTiles === 0) {
            this.refreshBoard();
        }
    }

    getTilePosition(row, col) {
        const tileSize = this.getTileSize();
        const {marginTop, tileSpacing} = Config.board;

        const posX = (tileSize / 2) + col * tileSize + ((col + 1) * tileSpacing);
        const posY = marginTop + (tileSize / 2) + row * tileSize + ((row + 1) * tileSpacing);
        return new Phaser.Geom.Point(posX, posY);
    }

    getTileSize() {
        const {width, board} = Config;
        const {columns, tileSpacing} = board;

        const tileSize = (width - (columns + 1) * tileSpacing) / columns;
        return tileSize;
    }

    isLegalPosition(row, col, value) {
        const rowInside = row >= 0 && row < Config.board.rows;
        const colInside = col >= 0 && col < Config.board.columns;
        if (!rowInside || !colInside) {
            return false;
        }
        const emptySpot = this.board[row][col].value === 0;
        const sameValue = this.board[row][col].value === value;
        const alreadyUpgraded = this.board[row][col].upgraded;
        return emptySpot || (sameValue && !alreadyUpgraded);
    }

    makeMove(d) {
        this.movingTiles = 0;
        const dRow = (d === Direction.LEFT || d === Direction.RIGHT) ? 0 : d === Direction.UP ? -1 : 1;
        const dCol = (d === Direction.UP || d === Direction.DOWN) ? 0 : d === Direction.LEFT ? -1 : 1;
        this.canMove = false;
        const firstRow = (d === Direction.UP) ? 1 : 0;
        const lastRow = Config.board.rows - ((d === Direction.DOWN) ? 1 : 0);
        const firstCol = (d === Direction.LEFT) ? 1 : 0;
        const lastCol = Config.board.columns - ((d === Direction.RIGHT) ? 1 : 0);
        for (let i = firstRow; i < lastRow; i++) {
            for (let j = firstCol; j < lastCol; j++) {
                const curRow = dRow === 1 ? (lastRow - 1) - i : i;
                const curCol = dCol === 1 ? (lastCol - 1) - j : j;
                const value = this.board[curRow][curCol].value;
                if (value !== 0) {
                    let newRow = curRow;
                    let newCol = curCol;
                    while (this.isLegalPosition(newRow + dRow, newCol + dCol, value)) {
                        newRow += dRow;
                        newCol += dCol;
                    }
                    if (newRow !== curRow || newCol !== curCol) {
                        const newPos = this.getTilePosition(newRow, newCol);
                        const willUpdate = this.board[newRow][newCol].value === value;
                        this.moveTile(this.board[curRow][curCol].sprite, newPos, willUpdate);
                        this.board[curRow][curCol].value = 0;
                        if (willUpdate) {
                            this.board[newRow][newCol].value++;
                            this.board[newRow][newCol].upgraded = true;
                            // this.board[curRow][curCol].sprite.setFrame(value);
                        } else {
                            this.board[newRow][newCol].value = value;
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
        this.screen.tweens.add({
            targets: [tile],
            x: point.x,
            y: point.y,
            ease: 'Elastic',
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

    refreshBoard() {
        for (let i = 0; i < Config.board.rows; i++) {
            for (let j = 0; j < Config.board.columns; j++) {
                const tilePosition = this.getTilePosition(i, j);
                this.board[i][j].sprite.x = tilePosition.x;
                this.board[i][j].sprite.y = tilePosition.y;
                const value = this.board[i][j].value;
                if (value > 0) {
                    this.board[i][j].sprite.visible = true;
                    //this.board[i][j].sprite.setFrame(value - 1);
                    this.board[i][j].sprite.setFrame(value);
                    this.board[i][j].upgraded = false;
                } else {
                    this.board[i][j].sprite.visible = false;
                }
            }
        }
        this.addTile();
    }

    upgradeTile(tile) {
        tile.setFrame(tile.frame.name + 1);
        this.screen.tweens.add({
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


};
