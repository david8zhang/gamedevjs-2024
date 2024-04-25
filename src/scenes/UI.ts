import { ActionIcon } from '../core/ui/ActionIcon'
import { GameOverModal } from '../core/ui/GameOverModal'
import { LevelUpMenu } from '../core/ui/LevelUpMenu'
import { UIValueBar } from '../core/ui/UIValueBar'
import { Constants } from '../utils/Constants'
import Game from './Game'

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
  public levelUpMenu!: LevelUpMenu

  constructor() {
    super('ui')
    if (!UI.instance) {
      UI.instance = this
    }
  }

  create() {
    this.dashIcon = new ActionIcon(this, {
      position: {
        x: 10,
        y: 10,
      },
      texture: 'dash',
    })
    this.jumpIcon = new ActionIcon(this, {
      position: {
        x: 65,
        y: 10,
      },
      texture: 'jump',
    })
    this.throwingStarIcon = new ActionIcon(this, {
      position: {
        x: 120,
        y: 10,
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

    this.gameOverModal = new GameOverModal(this)
    this.levelUpMenu = new LevelUpMenu(this)

    this.input.keyboard!.on(
      Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
      (e: Phaser.Input.Keyboard.Key) => {
        if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.L) {
          console.log('==== TESTING LEVEL UP ===')
          this.scene.manager.pause(Game.instance)
          this.levelUpMenu.show()
        }
      }
    )
  }

  decreasePlayerHealth(amount: number) {
    this.healthbar.decrease(amount)
    this.healthText.setText(
      `${this.healthbar.currValue}/${this.healthbar.maxValue}`
    )
  }
}
