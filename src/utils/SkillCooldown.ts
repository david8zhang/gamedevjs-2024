import { ActionIcon } from '../core/ui/ActionIcon'
import { UI } from '../scenes/UI'

export default class SkillCooldown {
  public usesLeft: number
  public maxUses: number

  private cooldownTime: number
  private timer: number
  private actionIcon: keyof UI

  constructor(cooldownTime: number, actionIcon: keyof UI) {
    this.cooldownTime = cooldownTime
    this.timer = cooldownTime
    this.usesLeft = 1
    this.maxUses = 1
    this.actionIcon = actionIcon
  }

  update(dt: number) {
    if (this.usesLeft >= this.maxUses) {
      return
    }

    this.timer -= dt
    if (this.timer <= 0) {
      this.usesLeft++
      this.timer = this.cooldownTime
    } else {
      this.getActionIcon().updateCooldownOverlay(this.timer / this.cooldownTime)
    }
    if (this.maxUses > 1) {
      this.getActionIcon().updateNumberBadge(this.usesLeft)
    }
  }

  private getActionIcon(): ActionIcon {
    return UI.instance[this.actionIcon] as ActionIcon
  }
}
