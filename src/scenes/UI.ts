import { ActionIcon } from '../ui/ActionIcon'

export class UI extends Phaser.Scene {
  public dashIcon!: ActionIcon
  public jumpIcon!: ActionIcon
  public static instance: UI

  constructor() {
    super('ui')
    if (!UI.instance) {
      UI.instance = this
    }
  }

  create() {
    this.dashIcon = new ActionIcon(this, {
      position: {
        x: 5,
        y: 5,
      },
      texture: 'dash',
    })
    this.jumpIcon = new ActionIcon(this, {
      position: {
        x: 55,
        y: 5,
      },
      texture: 'jump',
    })
  }
}
