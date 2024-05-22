import { Scene } from 'phaser'
import { Constants } from '../utils/Constants'

export class Start extends Scene {
  constructor() {
    super('start')
  }

  create() {
    this.add
      .sprite(
        Constants.WINDOW_WIDTH / 2,
        Constants.WINDOW_HEIGHT / 2,
        'tile-bg'
      )
      .setDisplaySize(Constants.WINDOW_WIDTH, Constants.WINDOW_HEIGHT)
      .setAlpha(0.5)

    const titleText = this.add
      .text(
        Constants.WINDOW_WIDTH / 2,
        Constants.WINDOW_HEIGHT / 2,
        'Shinobot',
        {
          fontSize: '100px',
          fontFamily: 'ninja',
        }
      )
      .setOrigin(0.5, 0.5)
      .setStroke('black', 10)

    this.sound.play('bgm', { loop: true, volume: 0.45 })

    this.add
      .text(titleText.x, titleText.y + titleText.displayHeight + 15, 'Play', {
        fontSize: '30px',
        fontFamily: 'ninja',
      })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5, 0.5)
      .on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.scene.start('game')
        this.scene.start('ui')
      })
  }
}
