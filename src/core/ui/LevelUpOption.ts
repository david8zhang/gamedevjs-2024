import { UI } from '../../scenes/UI'
import PowerUp from '../powerup/PowerUp'

export interface Config {
  position: {
    x: number
    y: number
  }
  defaultPowerUp: PowerUp
}

export class LevelUpOption {
  private ui: UI
  private button: Phaser.GameObjects.Rectangle
  private powerUp: PowerUp
  private text: Phaser.GameObjects.Text

  constructor(ui: UI, config: Config) {
    this.ui = ui
    this.powerUp = config.defaultPowerUp
    this.button = this.ui.add
      .rectangle(config.position.x, config.position.y, 184, 300, 0xff7c09)
      .setStrokeStyle(2, 0x000000)
      .setVisible(false)

    this.text = this.ui.add
      .text(this.button.x, this.button.y, 'test', {
        fontSize: '25px',
        color: 'white',
        fontFamily: 'electric-boots',
        wordWrap: { width: 176, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false)
      .setStroke('black', 5)
    this.button.setVisible(false).setInteractive({ useHandCursor: true })
    this.button.on('pointerup', () => {
      this.ui.scene.resume('game')
      this.ui.levelUpMenu.hide()
      this.ui.sound.play('powerup', { volume: 0.5 })
      this.powerUp.onPickUp()
      this.ui.increasePlayerHealth(this.ui.healthbar.maxValue)
    })
  }

  assignNewPowerUp(powerUp: PowerUp) {
    this.text.setText(powerUp.description)
    this.powerUp = powerUp
  }

  show() {
    this.button.setVisible(true)
    this.text.setVisible(true)
  }

  hide() {
    this.button.setVisible(false)
    this.text.setVisible(false)
  }
}
