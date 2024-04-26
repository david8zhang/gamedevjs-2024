import { ActionIcon } from '../core/ui/ActionIcon'
import { ComboText } from '../core/ui/ComboText'
import { GameOverModal } from '../core/ui/GameOverModal'
import { UIValueBar } from '../core/ui/UIValueBar'
import { Constants } from '../utils/Constants'
import { LevelUpMenu } from '../core/ui/LevelUpMenu'
import Game from './Game'
import { Player } from '../core/Player'

export class UI extends Phaser.Scene {
  public dashIcon!: ActionIcon
  public jumpIcon!: ActionIcon
  public throwingStarIcon!: ActionIcon
  public static instance: UI

  // Health bar
  public statBgRect!: Phaser.GameObjects.Rectangle
  public healthbar!: UIValueBar
  public healthLabelText!: Phaser.GameObjects.Text
  public healthText!: Phaser.GameObjects.Text

  public expBar!: UIValueBar
  public expLabelText!: Phaser.GameObjects.Text
  public expText!: Phaser.GameObjects.Text
  public levelText!: Phaser.GameObjects.Text

  public gameOverModal!: GameOverModal
  public comboText!: ComboText
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
    graphics.fillRoundedRect(Constants.WINDOW_WIDTH / 2 - 150, 0, 300, 90, 5)

    this.healthbar = new UIValueBar(this, {
      x: Constants.WINDOW_WIDTH / 2 - 100,
      y: 30,
      width: 235,
      height: 20,
      maxValue: 100,
      borderWidth: 4,
      showBorder: true,
    })

    this.expBar = new UIValueBar(this, {
      x: Constants.WINDOW_WIDTH / 2 - 100,
      y: this.healthbar.y + this.healthbar.height + 10,
      width: 235,
      height: 20,
      maxValue: 100,
      borderWidth: 4,
      showBorder: true,
      fillColor: 0xdae910,
    })
    this.expBar.setCurrValue(0)
    this.expBar.setMaxValue(
      Player.getExpRequiredForLevel(Game.instance.player.level)
    )

    this.healthLabelText = this.add
      .text(this.healthbar.x - 35, this.healthbar.y - 4, 'hp', {
        fontSize: '16px',
        color: 'white',
        fontFamily: 'electric-boots',
      })
      .setStroke('black', 5)

    this.expLabelText = this.add
      .text(this.expBar.x - 40, this.expBar.y - 4, 'exp', {
        fontSize: '16px',
        color: 'white',
        fontFamily: 'electric-boots',
      })
      .setStroke('black', 5)

    this.levelText = this.add
      .text(
        Constants.WINDOW_WIDTH / 2,
        2,
        `Lv. ${Game.instance.player.level}`,
        {
          fontSize: '16px',
          color: 'white',
          fontFamily: 'electric-boots',
        }
      )
      .setOrigin(0.5, 0)

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

    this.expText = this.add
      .text(
        (this.expBar.x + (this.expBar.x + this.expBar.width)) / 2,
        this.expBar.y - 4,
        `${this.expBar.currValue}/${this.expBar.maxValue}`,
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
    this.comboText = new ComboText(this)
  }

  increasePlayerExp(exp: number) {
    if (this.expBar.currValue + exp >= this.expBar.maxValue) {
      this.scene.manager.pause(Game.instance)
      this.levelUpMenu.show()
      Game.instance.player.level++

      const totalExp = this.expBar.currValue + exp
      this.expBar.setCurrValue(totalExp - this.expBar.maxValue)
      this.expBar.setMaxValue(
        Player.getExpRequiredForLevel(Game.instance.player.level)
      )
    } else {
      this.expBar.increase(exp)
    }
    this.expText.setText(`${this.expBar.currValue}/${this.expBar.maxValue}`)
    this.levelText.setText(`Lv. ${Game.instance.player.level}`)
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
