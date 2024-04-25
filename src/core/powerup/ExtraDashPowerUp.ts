import PowerUp from './PowerUp'

export default class ExtraDashPowerUp extends PowerUp {
  public description: string = 'Gain an extra dash'
  onPickUp(): void {
    this.player.dashSkillCooldown.maxUses += 1
  }
}
