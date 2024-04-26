import Game from '../scenes/Game'
import { Monster } from './Monster'

export interface MonsterSpawnerConfig {
  position: {
    x: number
    y: number
  }
}

export class MonsterSpawner {
  private static MAX_MONSTERS = 3
  private game: Game
  private monsters: Monster[] = []

  constructor(game: Game, config: MonsterSpawnerConfig) {
    this.game = game
    this.game.time.addEvent({
      delay: 5000,
      startAt: 5000,
      repeat: -1,
      callback: () => {
        this.monsters = this.monsters.filter((m: Monster) => !m.isDead)
        if (this.monsters.length < MonsterSpawner.MAX_MONSTERS) {
          const enemyType = this.getEnemyTypeToSpawn()
          const monster = new Monster(this.game, {
            position: {
              x: config.position.x,
              y: config.position.y - 10,
            },
            enemyType: enemyType,
          })
          this.monsters.push(monster)
        }
      },
    })
  }

  getEnemyTypeToSpawn() {
    if (this.game.player.level > 10) {
      return 'enemy-beetle'
    } else if (this.game.player.level > 25) {
      return 'enemy-squiggle'
    }
    return 'enemy-snail'
  }

  destroyAllMonsters() {
    this.monsters.forEach((m) => m.die())
  }
}
