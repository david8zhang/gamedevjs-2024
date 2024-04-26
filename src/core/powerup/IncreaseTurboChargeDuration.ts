import PowerUp from './PowerUp'

export default class IncreaseTurboChargeDuration extends PowerUp {
  public description: string = 'Increase turbo charge duration'
  onPickUp(): void {
    this.player.turboChargeDuration += 2000
  }
}
