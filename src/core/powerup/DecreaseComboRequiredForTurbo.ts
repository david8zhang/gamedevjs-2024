import PowerUp from './PowerUp'

export default class DecreaseComboRequiredForTurbo extends PowerUp {
  public description: string = 'Increase movement speed'
  onPickUp(): void {
    this.player.comboThresholdForTurbo = Math.max(
      1,
      this.player.comboThresholdForTurbo - 5
    )
  }
}
