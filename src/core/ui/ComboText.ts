import { UI } from '../../scenes/UI'
import { Constants } from '../../utils/Constants'

export class ComboText {
  private ui: UI
  private comboText: Phaser.GameObjects.Text
  private comboLabelText: Phaser.GameObjects.Text
  private fadeDownTween: Phaser.Tweens.Tween | null = null

  constructor(ui: UI) {
    this.ui = ui
    this.comboText = this.ui.add
      .text(Constants.WINDOW_WIDTH - 20, 20, '0', {
        fontSize: '50px',
        fontFamily: 'Night-Shift',
      })
      .setOrigin(1, 0)
      .setStroke('#1f7219', 10)
      .setVisible(false)

    this.comboLabelText = this.ui.add
      .text(
        Constants.WINDOW_WIDTH - 20,
        this.comboText.y + this.comboText.displayHeight / 2 + 25,
        'COMBO',
        {
          fontSize: '25px',
          fontFamily: 'Night-Shift',
        }
      )
      .setOrigin(1, 0)
      .setStroke('#1f7219', 10)
      .setVisible(false)
  }

  displayCombo(combo: number) {
    this.comboText.setY(20).setVisible(true)
    this.comboLabelText
      .setY(this.comboText.y + this.comboText.displayHeight / 2 + 25)
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
}
