import { UI } from '../../scenes/UI'
import PowerUp from './PowerUp'

export default class ExtraHealthPowerUp extends PowerUp {
  public description: string = 'Increase max health'
  onPickUp(): void {
    UI.instance.healthbar.setMaxValue(UI.instance.healthbar.maxValue + 10)
    UI.instance.healthText.setText(
      `${UI.instance.healthbar.currValue}/${UI.instance.healthbar.maxValue}`
    )
  }
}
