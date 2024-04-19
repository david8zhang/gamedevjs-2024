export enum CollisionCategory {
  PLAYER = 0b00000001,
  ENEMY = 0b00000010,
  WALLS = 0b00000100,
  FLOOR = 0b00001000,
  BOUNDS = 0b00010000,
  PLAYER_ENEMY_SENSOR = 0b00100000,
}

export enum CollisionLabel {
  PLAYER = 'PLAYER',
  PLAYER_ENEMY_SENSOR = 'PLAYER_ENEMY_SENSOR',
  ENEMY = 'ENEMY',
  WALLS = 'WALLS',
  FLOOR = 'FLOOR',
  BOUNDS = 'BOUNDS',
}

export class Constants {
  public static WINDOW_WIDTH = 800
  public static WINDOW_HEIGHT = 600
  public static GAME_WIDTH = 900
  public static GAME_HEIGHT = 900
}
