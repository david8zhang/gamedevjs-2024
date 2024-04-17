import { UI } from '../../scenes/UI'

export interface ActionIconConfig {
  texture: string
  position: {
    x: number
    y: number
  }
}

export class ActionIcon {
  private ui: UI
  private sprite: Phaser.GameObjects.Sprite
  private cooldownOverlay: Phaser.GameObjects.Rectangle

  constructor(ui: UI, config: ActionIconConfig) {
    this.ui = ui
    this.sprite = this.ui.add
      .sprite(config.position.x, config.position.y, config.texture)
      .setDisplaySize(45, 45)
      .setOrigin(0, 0)
    this.cooldownOverlay = this.ui.add
      .rectangle(
        config.position.x,
        config.position.y + this.sprite.displayHeight,
        45,
        45,
        0x000000,
        0.8
      )
      .setVisible(false)
      .setOrigin(0, 1)
  }

  updateCooldownOverlay(cooldownProgress: number) {
    this.cooldownOverlay.setVisible(true)
    this.cooldownOverlay.setDisplaySize(
      this.cooldownOverlay.width,
      this.cooldownOverlay.height * cooldownProgress
    )
  }
}
