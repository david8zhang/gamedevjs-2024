import { UI } from '../../scenes/UI'
import { Constants } from '../../utils/Constants'

export class GameOverModal {
  private ui: UI
  private bgGraphics: Phaser.GameObjects.Graphics
  private okButton: Phaser.GameObjects.Rectangle

  private deathText: Phaser.GameObjects.Text
  private okText: Phaser.GameObjects.Text

  constructor(ui: UI) {
    this.ui = ui

    this.bgGraphics = this.ui.add.graphics()
    this.bgGraphics.setVisible(false)
    const bgRectWidth = 450
    const bgRectHeight = 200
    this.bgGraphics.fillStyle(0x1ea8e3, 0.8)
    this.bgGraphics.fillRoundedRect(
      Constants.WINDOW_WIDTH / 2 - bgRectWidth / 2,
      Constants.WINDOW_HEIGHT / 2 - bgRectHeight / 2,
      bgRectWidth,
      bgRectHeight,
      10
    )

    this.deathText = this.ui.add
      .text(
        Constants.WINDOW_WIDTH / 2,
        Constants.WINDOW_HEIGHT / 2 - 20,
        'you died! press ok to respawn',
        {
          fontSize: '30px',
          color: 'white',
          fontFamily: 'electric-boots',
        }
      )
      .setVisible(false)
      .setOrigin(0.5, 0.5)
      .setStroke('#000000', 5)

    this.okButton = this.ui.add
      .rectangle(
        Constants.WINDOW_WIDTH / 2,
        this.deathText.y + this.deathText.displayHeight + 15,
        80,
        30,
        0xff7c09
      )
      .setStrokeStyle(2, 0x000000)
      .setVisible(false)

    this.okText = this.ui.add
      .text(this.okButton.x, this.okButton.y - 3, 'ok', {
        fontSize: '18px',
        color: 'white',
        fontFamily: 'electric-boots',
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false)
      .setStroke('black', 5)
    this.okButton.setVisible(false).setInteractive({ useHandCursor: true })
    this.okButton.on('pointerup', () => {
      this.ui.scene.start('game')
      this.ui.scene.start('ui')
    })
  }

  show() {
    this.okText.setVisible(true)
    this.okButton.setVisible(true)
    this.bgGraphics.setVisible(true)
    this.deathText.setVisible(true)
  }
}
