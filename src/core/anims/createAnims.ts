export const createAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'slash-vertical-hit',
    frames: anims.generateFrameNames('slash-vertical-hit', {
      start: 0,
      end: 5,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 15,
  })

  anims.create({
    key: 'slash-horizontal-hit',
    frames: anims.generateFrameNames('slash-horizontal-hit', {
      start: 0,
      end: 5,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 15,
  })

  anims.create({
    key: 'slash-horizontal',
    frames: anims.generateFrameNames('slash-horizontal', {
      start: 0,
      end: 5,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 30,
  })

  anims.create({
    key: 'slash-vertical',
    frames: anims.generateFrameNames('slash-vertical', {
      start: 0,
      end: 5,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 30,
  })

  anims.create({
    key: 'dash-strike',
    frames: anims.generateFrameNames('dash-strike', {
      start: 0,
      end: 5,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 15,
  })

  anims.createFromAseprite('player')
  anims.createFromAseprite('enemy-squiggle')
  anims.createFromAseprite('enemy-beetle')
  anims.createFromAseprite('enemy-snail')
}
