export enum CollisionCategory {
  PLAYER = 0b00000001,
  ENEMY = 0b00000010,
  WALLS = 0b00000100,
  FLOOR = 0b00001000,
  BOUNDS = 0b00010000,
}

export class Constants {
  public static WINDOW_WIDTH = 800
  public static WINDOW_HEIGHT = 600
  public static GAME_WIDTH = 900
  public static GAME_HEIGHT = 900
}
