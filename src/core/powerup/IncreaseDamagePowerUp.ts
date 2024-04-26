import PowerUp from './PowerUp'

export default class IncreaseDamagePowerUp extends PowerUp {
  public description: string = 'Increase damage of all attacks'
  onPickUp(): void {
    this.player.minDamage += 2
    this.player.maxDamage += 2
  }
}
