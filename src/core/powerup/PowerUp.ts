import { Player } from '../Player'

export default class PowerUp {
  protected player: Player
  public description: string = ''

  constructor(player: Player) {
    this.player = player
  }

  onPickUp(): void {}
}
