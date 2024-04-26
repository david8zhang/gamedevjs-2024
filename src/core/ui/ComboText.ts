import { UI } from '../../scenes/UI'
import { Constants } from '../../utils/Constants'
import { UIValueBar } from './UIValueBar'

export class ComboText {
  private static STROKE_COLOR = '#4991e2'
  private static TEXT_COLOR = 'white'

  private ui: UI
  private comboText: Phaser.GameObjects.Text
  private comboLabelText: Phaser.GameObjects.Text
  private fadeDownTween: Phaser.Tweens.Tween | null = null
  private turboChargeTween: Phaser.Tweens.Tween | null = null
  private turboChargeMeter: UIValueBar

  constructor(ui: UI) {
    this.ui = ui
    this.comboText = this.ui.add
      .text(Constants.WINDOW_WIDTH - 10, 5, '0', {
        fontSize: '40px',
        fontFamily: 'electric-boots',
        color: ComboText.TEXT_COLOR,
      })
      .setOrigin(1, 0)
      .setStroke(ComboText.STROKE_COLOR, 10)
      .setVisible(false)

    this.comboLabelText = this.ui.add
      .text(
        Constants.WINDOW_WIDTH - 10,
        this.comboText.y + this.comboText.displayHeight / 2 + 20,
        'charge',
        {
          fontSize: '20px',
          fontFamily: 'electric-boots',
          color: ComboText.TEXT_COLOR,
        }
      )
      .setOrigin(1, 0)
      .setStroke(ComboText.STROKE_COLOR, 8)
      .setVisible(false)

    this.turboChargeMeter = new UIValueBar(this.ui, {
      x: Constants.WINDOW_WIDTH - 120,
      y: this.comboText.y + this.comboText.displayHeight + 20,
      width: 100,
      height: 10,
      fillColor: 0xee71cd,
      showBorder: false,
      borderWidth: 0,
      maxValue: 100,
      radius: 0,
    })
    this.turboChargeMeter.setVisible(false)
  }

  endTurbocharge() {
    this.comboText.setVisible(false)
    this.comboLabelText.setVisible(false)
    if (this.turboChargeTween) {
      this.turboChargeTween.destroy()
    }
    this.turboChargeMeter.setCurrValue(100)
    this.turboChargeMeter.setVisible(false)
  }

  displayTurbocharged() {
    if (this.fadeDownTween) {
      this.fadeDownTween.destroy()
    }
    this.comboText
      .setText('Turbo')
      .setFontSize('40px')
      .setAlpha(1)
      .setPosition(Constants.WINDOW_WIDTH - 10, 10)
      .setStroke('#ee71cd', 8)
      .setStyle({ color: 'white' })
      .setVisible(true)
    this.comboLabelText.setVisible(false)
    this.turboChargeTween = this.ui.add.tween({
      targets: [this.comboText],
      scale: {
        from: 1,
        to: 1.25,
      },
      yoyo: true,
      repeat: -1,
      duration: 400,
      ease: Phaser.Math.Easing.Sine.InOut,
    })
    this.turboChargeMeter.setVisible(true)
  }

  displayCombo(combo: number) {
    this.comboText
      .setY(5)
      .setVisible(true)
      .setFontSize('40px')
      .setStroke(ComboText.STROKE_COLOR, 10)
      .setStyle({ color: ComboText.TEXT_COLOR })

    this.comboLabelText
      .setText(`${combo > 1 ? 'Charges' : 'Charge'}`)
      .setY(this.comboText.y + this.comboText.displayHeight / 2 + 20)
      .setVisible(true)

    this.ui.tweens.add({
      targets: [this.comboText, this.comboLabelText],
      scale: {
        from: 1,
        to: 1.5,
      },
      yoyo: true,
      duration: 100,
      ease: Phaser.Math.Easing.Sine.InOut,
    })
    this.comboText.setText(`${combo}`)
    if (this.fadeDownTween) {
      this.fadeDownTween.destroy()
    }
    this.fadeDownTween = this.ui.tweens.add({
      targets: [this.comboText, this.comboLabelText],
      delay: 2000,
      y: '+=25',
      duration: 3000,
      ease: Phaser.Math.Easing.Sine.Out,
    })
  }

  fadeDown(alpha: number) {
    this.comboText.setAlpha(alpha)
    this.comboLabelText.setAlpha(alpha)
  }

  decreaseTurboChargeMeter(pct: number) {
    this.turboChargeMeter.setCurrValue(100 * pct)
  }
}
