import Game from './scenes/Game'
import Preload from './scenes/Preload'
import { UI } from './scenes/UI'
import { Constants } from './utils/Constants'

const config = {
  width: Constants.WINDOW_WIDTH,
  height: Constants.WINDOW_HEIGHT,
  type: Phaser.AUTO,
  pixelArt: true,
  parent: 'phaser',
  scene: [Preload, Game, UI],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'matter',
    matter: {
      // gravity: { x: 0, y: 0 },
      debug: true,
    },
  },
  dom: {
    createContainer: true,
  },
}

new Phaser.Game(config)
