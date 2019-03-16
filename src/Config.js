import Phaser from "phaser";


export default {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    backgroundColor: '#fefcca',
    board: {
        rows: 4,
        columns: 4,
        tileSpacing: 10,
        marginTop: 100
    },

    tweenSpeed: 350,
    swipeMaxTime: 1000,
    swipeMinDistance: 20,
    swipeMinNormal: 0.85
};
