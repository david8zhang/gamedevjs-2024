import Game from '../../scenes/Game'
import { UI } from '../../scenes/UI'
import { Constants } from '../../utils/Constants'
import ExtraDashPowerUp from '../powerup/ExtraDashPowerUp'
import ExtraJumpPowerUp from '../powerup/ExtraJumpPowerUp'
import ExtraProjectilePowerUp from '../powerup/ExtraProjectilePowerUp'
import PowerUp from '../powerup/PowerUp'

export class LevelUpMenu {
  private ui: UI
  private bgGraphics: Phaser.GameObjects.Graphics
  private levelUpText: Phaser.GameObjects.Text

  private option1Button: Phaser.GameObjects.Rectangle
  private option1Text: Phaser.GameObjects.Text
  private option2Button: Phaser.GameObjects.Rectangle
  private option2Text: Phaser.GameObjects.Text
  private option3Button: Phaser.GameObjects.Rectangle
  private option3Text: Phaser.GameObjects.Text

  constructor(ui: UI) {
    this.ui = ui

    this.bgGraphics = this.ui.add.graphics()
    this.bgGraphics.setVisible(false)
    const bgRectWidth = 600
    const bgRectHeight = 400
    this.bgGraphics.fillStyle(0x1ea8e3, 0.8)
    this.bgGraphics.fillRoundedRect(
      Constants.WINDOW_WIDTH / 2 - bgRectWidth / 2,
      Constants.WINDOW_HEIGHT / 2 - bgRectHeight / 2,
      bgRectWidth,
      bgRectHeight,
      10
    )

    this.levelUpText = this.ui.add
      .text(
        Constants.WINDOW_WIDTH / 2,
        Constants.WINDOW_HEIGHT / 2 - 164,
        'Level up!',
        {
          fontSize: '20px',
          color: 'white',
        }
      )
      .setVisible(false)
      .setOrigin(0.5, 0.5)

    this.option1Button = this.ui.add
      .rectangle(
        Constants.WINDOW_WIDTH / 2 - (184 + 8),
        Constants.WINDOW_HEIGHT / 2 + 24,
        184,
        300,
        0xff7c09
      )
      .setStrokeStyle(2, 0x000000)
      .setVisible(false)

    this.option1Text = this.ui.add
      .text(this.option1Button.x, this.option1Button.y, 'test', {
        fontSize: '14px',
        color: 'white',
        wordWrap: { width: 176, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false)
      .setStroke('black', 5)
    this.option1Button.setVisible(false).setInteractive({ useHandCursor: true })
    this.option1Button.on('pointerup', () => {
      this.ui.scene.resume('game')
      this.hide()
    })

    this.option2Button = this.ui.add
      .rectangle(
        Constants.WINDOW_WIDTH / 2,
        Constants.WINDOW_HEIGHT / 2 + 24,
        184,
        300,
        0xff7c09
      )
      .setStrokeStyle(2, 0x000000)
      .setVisible(false)

    this.option2Text = this.ui.add
      .text(this.option2Button.x, this.option2Button.y, 'test2', {
        fontSize: '14px',
        color: 'white',
        wordWrap: { width: 176, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false)
      .setStroke('black', 5)
    this.option2Button.setVisible(false).setInteractive({ useHandCursor: true })
    this.option2Button.on('pointerup', () => {
      this.ui.scene.resume('game')
      this.hide()
    })

    this.option3Button = this.ui.add
      .rectangle(
        Constants.WINDOW_WIDTH / 2 + 184 + 8,
        Constants.WINDOW_HEIGHT / 2 + 24,
        184,
        300,
        0xff7c09
      )
      .setStrokeStyle(2, 0x000000)
      .setVisible(false)

    this.option3Text = this.ui.add
      .text(this.option3Button.x, this.option3Button.y, 'test3', {
        fontSize: '14px',
        color: 'white',
        wordWrap: { width: 176, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false)
      .setStroke('black', 5)
    this.option3Button.setVisible(false).setInteractive({ useHandCursor: true })
    this.option3Button.on('pointerup', () => {
      this.ui.scene.resume('game')
      this.hide()
    })
  }

  show() {
    this.option1Text.setVisible(true)
    this.option1Button.setVisible(true)
    this.option2Text.setVisible(true)
    this.option2Button.setVisible(true)
    this.option3Text.setVisible(true)
    this.option3Button.setVisible(true)
    this.bgGraphics.setVisible(true)
    this.levelUpText.setVisible(true)

    const powerUps = this.choose3RandomPowerUps()
    this.setOptionButton(this.option1Button, this.option1Text, powerUps[0])
    this.setOptionButton(this.option2Button, this.option2Text, powerUps[1])
    this.setOptionButton(this.option3Button, this.option3Text, powerUps[2])
  }

  hide() {
    this.option1Text.setVisible(false)
    this.option1Button.setVisible(false)
    this.option2Text.setVisible(false)
    this.option2Button.setVisible(false)
    this.option3Text.setVisible(false)
    this.option3Button.setVisible(false)
    this.bgGraphics.setVisible(false)
    this.levelUpText.setVisible(false)
  }

  private setOptionButton(
    button: Phaser.GameObjects.Rectangle,
    buttonText: Phaser.GameObjects.Text,
    powerUp: PowerUp
  ) {
    buttonText.setText(powerUp.description)
    button.on('pointerup', () => {
      powerUp.onPickUp()
    })
  }

  private choose3RandomPowerUps(): PowerUp[] {
    const powerUps = this.shuffleArray([
      ExtraDashPowerUp,
      ExtraJumpPowerUp,
      ExtraProjectilePowerUp,
    ])
    return powerUps
      .slice(0, 3)
      .map((PowerUp) => new PowerUp(Game.instance.player))
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }
}
