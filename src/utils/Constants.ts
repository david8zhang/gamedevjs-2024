export enum CollisionCategory {
  PLAYER = 1,
  ENEMY = 2,
  WALLS = 4,
  FLOOR = 8,
  BOUNDS = 16,
  PLAYER_ENEMY_SENSOR = 32,
  ATTACK_HITBOX = 64,
  PROJECTILE = 128,
}

export enum CollisionLabel {
  PLAYER = 'PLAYER',
  PLAYER_ENEMY_SENSOR = 'PLAYER_ENEMY_SENSOR',
  ATTACK_HITBOX = 'ATTACK_HITBOX',
  ENEMY = 'ENEMY',
  WALLS = 'WALLS',
  FLOOR = 'FLOOR',
  BOUNDS = 'BOUNDS',
}

export class Constants {
  public static WINDOW_WIDTH = 800
  public static WINDOW_HEIGHT = 600
  public static GAME_WIDTH = 2400
  public static GAME_HEIGHT = 2400
}
