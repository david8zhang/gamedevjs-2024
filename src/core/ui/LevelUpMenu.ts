import Game from '../../scenes/Game'
import { UI } from '../../scenes/UI'
import { Constants } from '../../utils/Constants'
import ExtraDashPowerUp from '../powerup/ExtraDashPowerUp'
import ExtraHealthPowerUp from '../powerup/ExtraHealthPowerUp'
import ExtraJumpPowerUp from '../powerup/ExtraJumpPowerUp'
import ExtraProjectilePowerUp from '../powerup/ExtraProjectilePowerUp'
import IncreaseDamagePowerUp from '../powerup/IncreaseDamagePowerUp'
import IncreaseTurboChargeDuration from '../powerup/IncreaseTurboChargeDuration'
import PowerUp from '../powerup/PowerUp'
import { LevelUpOption } from './LevelUpOption'

export class LevelUpMenu {
  private ui: UI
  private bgGraphics: Phaser.GameObjects.Graphics
  private levelUpText: Phaser.GameObjects.Text
  private option1: LevelUpOption
  private option2: LevelUpOption
  private option3: LevelUpOption

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

    const powerUps = this.choose3RandomPowerUps()

    this.option1 = new LevelUpOption(this.ui, {
      position: {
        x: Constants.WINDOW_WIDTH / 2 - (184 + 8),
        y: Constants.WINDOW_HEIGHT / 2 + 24,
      },
      defaultPowerUp: powerUps[0],
    })
    this.option2 = new LevelUpOption(this.ui, {
      position: {
        x: Constants.WINDOW_WIDTH / 2,
        y: Constants.WINDOW_HEIGHT / 2 + 24,
      },
      defaultPowerUp: powerUps[1],
    })
    this.option3 = new LevelUpOption(this.ui, {
      position: {
        x: Constants.WINDOW_WIDTH / 2 + 184 + 8,
        y: Constants.WINDOW_HEIGHT / 2 + 24,
      },
      defaultPowerUp: powerUps[2],
    })
  }

  show() {
    this.option1.show()
    this.option2.show()
    this.option3.show()
    this.bgGraphics.setVisible(true)
    this.levelUpText.setVisible(true)

    const powerUps = this.choose3RandomPowerUps()
    this.option1.assignNewPowerUp(powerUps[0])
    this.option2.assignNewPowerUp(powerUps[1])
    this.option3.assignNewPowerUp(powerUps[2])
  }

  hide() {
    this.option1.hide()
    this.option2.hide()
    this.option3.hide()
    this.bgGraphics.setVisible(false)
    this.levelUpText.setVisible(false)
  }

  private choose3RandomPowerUps(): PowerUp[] {
    const powerUps = this.shuffleArray([
      ExtraDashPowerUp,
      ExtraJumpPowerUp,
      ExtraProjectilePowerUp,
      ExtraHealthPowerUp,
      IncreaseDamagePowerUp,
      IncreaseTurboChargeDuration,
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
