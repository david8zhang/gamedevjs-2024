import { ActionIcon } from '../core/ui/ActionIcon'
import { UIValueBar } from '../core/ui/UIValueBar'
import { Constants } from '../utils/Constants'

export class UI extends Phaser.Scene {
  public dashIcon!: ActionIcon
  public jumpIcon!: ActionIcon
  public static instance: UI

  // Health bar
  public healthBgRect!: Phaser.GameObjects.Rectangle
  public healthbar!: UIValueBar
  public healthLabelText!: Phaser.GameObjects.Text
  public healthText!: Phaser.GameObjects.Text

  constructor() {
    super('ui')
    if (!UI.instance) {
      UI.instance = this
    }
  }

  create() {
    this.dashIcon = new ActionIcon(this, {
      position: {
        x: 5,
        y: 5,
      },
      texture: 'dash',
    })
    this.jumpIcon = new ActionIcon(this, {
      position: {
        x: 55,
        y: 5,
      },
      texture: 'jump',
    })

    const graphics = this.add.graphics()
    graphics.fillStyle(0x000000, 0.5)
    graphics.fillRoundedRect(
      Constants.WINDOW_WIDTH / 2 - 150,
      Constants.WINDOW_HEIGHT - 65,
      300,
      50,
      5
    )

    this.healthbar = new UIValueBar(this, {
      x: Constants.WINDOW_WIDTH / 2 - 100,
      y: Constants.WINDOW_HEIGHT - 50,
      width: 235,
      height: 20,
      maxValue: 100,
      borderWidth: 4,
      showBorder: true,
    })

    this.healthLabelText = this.add.text(
      this.healthbar.x - 35,
      this.healthbar.y + 2,
      'HP'
    )

    this.healthText = this.add
      .text(
        (this.healthbar.x + (this.healthbar.x + this.healthbar.width)) / 2,
        this.healthbar.y + 3,
        `${this.healthbar.currValue}/${this.healthbar.maxValue}`,
        {
          fontSize: '16px',
          color: 'white',
        }
      )
      .setDepth(1000)
      .setOrigin(0.5, 0)
  }

  decreasePlayerHealth(amount: number) {
    this.healthbar.decrease(amount)
    this.healthText.setText(
      `${this.healthbar.currValue}/${this.healthbar.maxValue}`
    )
  }
}
