import PowerUp from './PowerUp'

export default class ExtraProjectilePowerUp extends PowerUp {
  public description: string = 'Gain an extra projectile'
  onPickUp(): void {
    this.player.projectileSkillCooldown.maxUses += 1
  }
}
