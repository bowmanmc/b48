import Config from '../Config';


export default class GameBoard {

    constructor(screen) {
        this.screen = screen;
        this.boardArray = [];

    }

    getTileSize() {
        const {width, board} = Config;
        const {columns, tileSpacing} = board;

        const tileSize = (width - (columns + 1) * tileSpacing) / columns;
        return tileSize;
    }
};
