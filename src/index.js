import Phaser from 'phaser';

import Config from './Config';
//import HomeScreen from './scene/HomeScreen';
import BootScreen from './scene/BootScreen';
import PlayScreen from './scene/PlayScreen';


import './styles/index.scss';



const gameConfig = Object.assign({}, Config);
gameConfig.scene = [BootScreen, PlayScreen];

new Phaser.Game(gameConfig);

window.focus();

