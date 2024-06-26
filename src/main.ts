import Game from './scenes/Game'
import Preload from './scenes/Preload'
import { Start } from './scenes/Start'
import { UI } from './scenes/UI'
import { Constants } from './utils/Constants'

const config = {
  width: Constants.WINDOW_WIDTH,
  height: Constants.WINDOW_HEIGHT,
  type: Phaser.AUTO,
  pixelArt: true,
  parent: 'phaser',
  scene: [Preload, Start, Game, UI],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'matter',
    matter: {
      // gravity: { x: 0, y: 100 },
      // debug: true,
    },
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  dom: {
    createContainer: true,
  },
}

new Phaser.Game(config)
