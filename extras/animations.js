/**
 * Creates every animation that will be used in the game.
 * 
 * Called by the boot scene after loading all assets.
 */
function animations( scene ) {
  var frames;

  // Main Menu
  scene.anims.create( {
    key: 'menu_background_stars',
    frames: 'menu_background_stars_frames',
    frameRate: 5,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'menu_background_bird',
    frames: 'menu_branchBird_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'start',
    frames: 'start_frames',
    frameRate: 5,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'options',
    frames: 'options_frames',
    frameRate: 5,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'quit',
    frames: 'quit_frames',
    frameRate: 5,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'trophy_shine',
    frames: 'trophy_frames',
    frameRate: 10
  } );

  // Keyboard tip anims
  scene.anims.create( {
    key: 'enter',
    frames: 'enter_frames',
    frameRate: 5,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'confirm',
    frames: 'confirm_frames',
    frameRate: 5,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'esc',
    frames: 'esc_frames',
    frameRate: 5,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'escape',
    frames: 'escape_frames',
    frameRate: 5,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'arrowKeys',
    frames: 'arrowKeys_frames',
    frameRate: 5,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'select',
    frames: 'select_frames',
    frameRate: 5,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'back',
    frames: 'back_frames',
    frameRate: 5,
    repeat: -1
  } );

  // Player anims
  scene.anims.create( {
    key: 'birdBody_down',
    frames: 'birdBodyDown_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'birdBody_left',
    frames: 'birdBodyLeft_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'birdBody_up',
    frames: 'birdBodyUp_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'birdBody_right',
    frames: 'birdBodyRight_frames',
    frameRate: 10,
    repeat: -1
  } );

  frames = scene.anims.generateFrameNumbers( 'birdDie_frames', {
    frames: [ 0, 1 ]
  } );
  scene.anims.create( {
    key: 'bird_die',
    frames: [ {
      key: 'birdHurt'
    }, frames[ 0 ], frames[ 1 ] ],
    frameRate: 10
  } );

  frames = scene.anims.generateFrameNumbers( 'laser_frames', {
    frames: [ 2, 3, 4 ]
  } );
  scene.anims.create( {
    key: 'laser_explode_1',
    frames: frames,
    frameRate: 15
  } );

  frames = scene.anims.generateFrameNumbers( 'laser_frames', {
    frames: [ 5, 6, 7 ]
  } );
  scene.anims.create( {
    key: 'laser_explode_2',
    frames: frames,
    frameRate: 15
  } );

  scene.anims.create( {
    key: 'superLaser_start',
    frames: 'superLaser_start_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'superLaser_middle',
    frames: 'superLaser_middle_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'superLaser_end',
    frames: 'superLaser_end_frames',
    frameRate: 10,
    repeat: -1
  } );

  // Cat demon
  scene.anims.create( {
    key: 'catDemon_idle',
    frames: 'catDemonIdle_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'catDemon_walk',
    frames: 'catDemonWalk_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'catDemon_run',
    frames: 'catDemonRun_frames',
    frameRate: 25,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'catDemon_die',
    frames: 'catDemonDie_frames',
    frameRate: 20
  } );

  // Lizard demon
  scene.anims.create( {
    key: 'lizardDemon_idle',
    frames: 'lizardDemonIdle_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'lizardDemon_attack',
    frames: 'lizardDemonAttack_frames',
    frameRate: 10
  } );

  scene.anims.create( {
    key: 'energyBall_float',
    frames: 'energyBallFloat_frames',
    frameRate: 15,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'energyBall_explode',
    frames: 'energyBallExplode_frames',
    frameRate: 20
  } );

  scene.anims.create( {
    key: 'lizardDemon_die',
    frames: 'lizardDemonDie_frames',
    frameRate: 13
  } );

  // Crazy Bird Lady
  scene.anims.create( {
    key: 'crazyBirdLady_idle',
    frames: 'crazyBirdLady_idle_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'crazyBirdLady_chase',
    frames: 'crazyBirdLady_chase_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'crazyBirdLady_rest',
    frames: 'crazyBirdLady_rest_frames',
    frameRate: 6,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'crazyBirdLady_changePhase',
    frames: 'crazyBirdLady_changePhase_frames',
    frameRate: 10
  } );

  scene.anims.create( {
    key: 'crazyBirdLady_sad_idle',
    frames: 'crazyBirdLady_sad_idle_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'crazyBirdLady_sad_chase',
    frames: 'crazyBirdLady_sad_chase_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'crazyBirdLady_sad_rest',
    frames: 'crazyBirdLady_sad_rest_frames',
    frameRate: 8,
    repeat: -1
  } );

  frames = scene.anims.generateFrameNumbers( 'crazyBirdLady_summonAttack_frames', {
    frames: [ 0, 1, 2 ]
  } );
  scene.anims.create( {
    key: 'crazyBirdLady_summonAttack_raiseArm',
    frames: frames,
    frameRate: 10
  } );

  frames = scene.anims.generateFrameNumbers( 'crazyBirdLady_summonAttack_frames', {
    frames: [ 1, 2 ]
  } );
  scene.anims.create( {
    key: 'crazyBirdLady_summonAttack_raiseLoop',
    frames: frames,
    frameRate: 10,
    repeat: -1
  } );

  frames = scene.anims.generateFrameNumbers( 'crazyBirdLady_summonAttack_frames', {
    frames: [ 3, 4, 5, 6, 7 ]
  } );
  scene.anims.create( {
    key: 'crazyBirdLady_summonAttack_lowerArm',
    frames: frames,
    frameRate: 10
  } );

  scene.anims.create( {
    key: 'crazyBirdLady_fall',
    frames: 'crazyBirdLady_fall_frames',
    frameRate: 10
  } );

  frames = scene.anims.generateFrameNumbers( 'crazyBirdLady_die_frames', {
    frames: [ 0, 1 ]
  } );
  scene.anims.create( {
    key: 'crazyBirdLady_die_stand',
    frames: frames,
    frameRate: 10,
    repeat: -1
  } );

  frames = scene.anims.generateFrameNumbers( 'crazyBirdLady_die_frames', {
    frames: [ 2, 3, 4 ]
  } );
  scene.anims.create( {
    key: 'crazyBirdLady_die_fall',
    frames: frames,
    frameRate: 10
  } );

  frames = scene.anims.generateFrameNumbers( 'crazyBirdLady_die_frames', {
    frames: [ 3, 4 ]
  } );
  scene.anims.create( {
    key: 'crazyBirdLady_die_sit',
    frames: frames,
    frameRate: 10,
    repeat: -1
  } );

  // Good Drawing
  scene.anims.create( {
    key: 'smoke',
    frames: 'smoke_frames',
    frameRate: 10
  } );

  scene.anims.create( {
    key: 'goodDrawing_run',
    frames: 'goodDrawing_run_frames',
    frameRate: 10,
    repeat: -1
  } );

  scene.anims.create( {
    key: 'goodDrawing_die',
    frames: 'goodDrawing_die_frames',
    frameRate: 10
  } );
}