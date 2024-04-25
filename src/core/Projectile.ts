import { BodyType } from 'matter'
import Game from '../scenes/Game'
import { CollisionCategory, CollisionLabel } from '../utils/Constants'
import { Monster } from './Monster'
import { Player } from './Player'

export interface ProjectileConfig {
  position: {
    x: number
    y: number
  }
  flipX: boolean
}

export class Projectile {
  private game: Game
  public sprite: Phaser.Physics.Matter.Sprite

  constructor(game: Game, config: ProjectileConfig) {
    this.game = game
    this.sprite = this.game.matter.add.sprite(
      config.position.x,
      config.position.y,
      'sawblade'
    )
    this.sprite
      .setIgnoreGravity(true)
      .setSensor(true)
      .setCollisionCategory(CollisionCategory.PROJECTILE)
      .setCollidesWith([CollisionCategory.ENEMY, CollisionCategory.BOUNDS])
      .setVelocityX(config.flipX ? -20 : 20)
      .setAngularVelocity(10)
      .setScale(2)

    this.sprite.setPosition(
      config.position.x,
      config.position.y - this.sprite.displayHeight / 2
    )

    this.sprite.setOnCollide((e: any) => {
      const { bodyA, bodyB } = e
      if (
        bodyA.label == CollisionLabel.ENEMY ||
        bodyB.label === CollisionLabel.ENEMY
      ) {
        // Take damage
        const enemyBody: BodyType =
          bodyA.label === CollisionLabel.ENEMY ? bodyA : bodyB
        const enemyGameObject = enemyBody.gameObject
        if (enemyGameObject) {
          const enemyRef = enemyGameObject.getData('ref') as Monster

          if (!enemyRef.isDead) {
            const flipX = this.sprite.active ? this.sprite.flipX : false

            // Add a bit of knockback
            enemyRef.sprite.setVelocity(flipX ? -2 : 2, -2.5)

            // Play the hit sprite
            const hitSprite = this.game.add
              .sprite(0, 0, '')
              .setVisible(false)
              .setScale(2)
              .setDepth(1000)
              .on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                hitSprite.destroy()
              })
            hitSprite.setPosition(enemyRef.sprite.x, enemyRef.sprite.y)
            hitSprite
              .setVisible(true)
              .play('slash-horizontal-hit')
              .setFlipX(flipX)

            const dmg =
              Player.DAMAGE *
              (this.game.player.isTurboCharged
                ? Player.TURBO_CHARGE_DMG_MULTIPLIER
                : 1)
            enemyRef.takeDamage(dmg, this.game.player.isTurboCharged)
          }
        }
      } else if (
        bodyA.label === CollisionLabel.BOUNDS ||
        bodyB.label === CollisionLabel.BOUNDS
      ) {
        this.sprite.destroy()
      }
    })
  }
}
