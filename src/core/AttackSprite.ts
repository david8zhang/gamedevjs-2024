import { BodyType } from 'matter'
import Game from '../scenes/Game'
import { CollisionLabel, CollisionCategory } from '../utils/Constants'
import { Monster } from './Monster'

export interface AttackSpriteConfig {
  hitboxScale: {
    width: number
    height: number
  }
  attackAnimKey: string
  hitAnimKey: string
  onComplete: Function
}

export class AttackSprite {
  private game: Game
  private sprite: Phaser.Physics.Matter.Sprite
  private attackHitboxActive: boolean = false
  private processedDamageMonsterIds: Set<String> = new Set()
  private attackAnimKey: string
  private hitAnimKey: string

  constructor(game: Game, config: AttackSpriteConfig) {
    this.game = game
    this.sprite = this.game.matter.add.sprite(0, 0, '')
    this.attackAnimKey = config.attackAnimKey
    this.hitAnimKey = config.hitAnimKey

    const { Bodies, Body } = (Phaser.Physics.Matter as any)
      .Matter as typeof MatterJS
    const mainBody = Bodies.rectangle(
      0,
      0,
      this.sprite.displayWidth * config.hitboxScale.width,
      this.sprite.displayHeight * config.hitboxScale.height,
      {
        isSensor: true,
      }
    )
    const compoundBody = Body.create({
      parts: [mainBody],
      label: CollisionLabel.ATTACK_HITBOX,
    }) as BodyType

    compoundBody.collisionFilter.category = CollisionCategory.ATTACK_HITBOX
    compoundBody.collisionFilter.mask = CollisionCategory.ENEMY

    this.sprite
      .setExistingBody(compoundBody as BodyType)
      .setVisible(false)
      .setStatic(true)
      .setFixedRotation()
      .setScale(3)
      .setSensor(true)
      .setDepth(1000)
      .on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        config.onComplete()
        this.processedDamageMonsterIds.clear()
      })
      .on(Phaser.Animations.Events.ANIMATION_UPDATE, (_: any, frame: any) => {
        if (frame.index <= 3) {
          this.attackHitboxActive = true
        } else {
          this.attackHitboxActive = false
        }
      })

    mainBody.onCollideActiveCallback = (e: any) => {
      const { bodyA, bodyB } = e
      if (
        bodyA.label === CollisionLabel.ENEMY ||
        bodyB.label === CollisionLabel.ENEMY
      ) {
        if (this.attackHitboxActive) {
          const enemyBody: BodyType =
            bodyA.label === CollisionLabel.ENEMY ? bodyA : bodyB
          const enemyGameObject = enemyBody.gameObject
          if (enemyGameObject) {
            const enemyRef = enemyGameObject.getData('ref') as Monster

            if (this.shouldProcessHitEvent(enemyRef)) {
              this.processedDamageMonsterIds.add(enemyRef.id)
              // Add a bit of knockback
              enemyRef.sprite.setVelocity(this.sprite.flipX ? -2 : 2, -2.5)

              // Play the hit sprite
              const hitSprite = this.game.add
                .sprite(this.sprite.x, this.sprite.y, '')
                .setVisible(false)
                .setScale(2)
                .setDepth(1000)
                .on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                  hitSprite.destroy()
                })
              hitSprite.setPosition(enemyRef.sprite.x, enemyRef.sprite.y)
              hitSprite
                .setVisible(true)
                .play(this.hitAnimKey)
                .setFlipX(this.sprite.flipX)

              enemyRef.takeDamage(
                this.game.player.calculateDamage(),
                this.game.player.isTurboCharged
              )
            }
          }
        }
      }
    }
  }

  shouldProcessHitEvent(enemy: Monster) {
    return (
      !this.processedDamageMonsterIds.has(enemy.id) &&
      !enemy.isDead &&
      enemy.isHitboxActive
    )
  }

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y)
  }

  setFlipX(isFlip: boolean) {
    this.sprite.setFlipX(isFlip)
  }

  setVisible(isVisible: boolean) {
    this.sprite.setVisible(isVisible)
  }

  play() {
    this.sprite.play(this.attackAnimKey)
  }
}
