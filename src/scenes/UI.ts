import { ActionIcon } from '../core/ui/ActionIcon'
import { ComboText } from '../core/ui/ComboText'
import { GameOverModal } from '../core/ui/GameOverModal'
import { UIValueBar } from '../core/ui/UIValueBar'
import { Constants } from '../utils/Constants'

export class UI extends Phaser.Scene {
  public dashIcon!: ActionIcon
  public jumpIcon!: ActionIcon
  public throwingStarIcon!: ActionIcon
  public static instance: UI

  // Health bar
  public healthBgRect!: Phaser.GameObjects.Rectangle
  public healthbar!: UIValueBar
  public healthLabelText!: Phaser.GameObjects.Text
  public healthText!: Phaser.GameObjects.Text
  public gameOverModal!: GameOverModal
  public comboText!: ComboText

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
    this.throwingStarIcon = new ActionIcon(this, {
      position: {
        x: 105,
        y: 5,
      },
      texture: 'throwing-stars',
    })

    const graphics = this.add.graphics()
    graphics.fillStyle(0x000000, 0.5)
    graphics.fillRoundedRect(
      Constants.WINDOW_WIDTH / 2 - 150,
      0,
      // Constants.WINDOW_HEIGHT - 65,
      300,
      50,
      5
    )

    this.healthbar = new UIValueBar(this, {
      x: Constants.WINDOW_WIDTH / 2 - 100,
      y: 16,
      // y: Constants.WINDOW_HEIGHT - 50,
      width: 235,
      height: 20,
      maxValue: 100,
      borderWidth: 4,
      showBorder: true,
    })

    this.healthLabelText = this.add
      .text(this.healthbar.x - 35, this.healthbar.y - 8, 'hp', {
        fontSize: '20px',
        color: 'white',
        fontFamily: 'electric-boots',
      })
      .setStroke('black', 5)

    this.healthText = this.add
      .text(
        (this.healthbar.x + (this.healthbar.x + this.healthbar.width)) / 2,
        this.healthbar.y - 4,
        `${this.healthbar.currValue}/${this.healthbar.maxValue}`,
        {
          fontSize: '16px',
          color: 'white',
          fontFamily: 'electric-boots',
        }
      )
      .setDepth(1000)
      .setStroke('black', 5)
      .setOrigin(0.5, 0)

    this.gameOverModal = new GameOverModal(this)

    this.comboText = new ComboText(this)
  }

  decreasePlayerHealth(amount: number) {
    this.healthbar.decrease(amount)
    this.healthText.setText(
      `${this.healthbar.currValue}/${this.healthbar.maxValue}`
    )
  }

  increasePlayerHealth(amount: number) {
    this.healthbar.increase(amount)
    this.healthText.setText(
      `${this.healthbar.currValue}/${this.healthbar.maxValue}`
    )
  }
}
