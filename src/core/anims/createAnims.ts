export const createAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'slash-hit',
    frames: anims.generateFrameNames('slash-hit', {
      start: 0,
      end: 5,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 12,
  })

  anims.create({
    key: 'slash1',
    frames: anims.generateFrameNames('slash1', {
      start: 0,
      end: 5,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 12,
  })

  anims.create({
    key: 'slash2',
    frames: anims.generateFrameNames('slash2', {
      start: 0,
      end: 5,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 12,
  })
}
