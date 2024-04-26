import PowerUp from './PowerUp'

export default class ExtraJumpPowerUp extends PowerUp {
  public description: string = 'Gain an extra double jump'
  onPickUp(): void {
    this.player.doubleJumpSkillCooldown.maxUses += 1
  }
}
