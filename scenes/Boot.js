class Boot extends Phaser.Scene {
  /**
   * Loads all assets to be used in the game.
   * 
   * First scene to be run in the game. Creates a 
   * spinning cat demon sprite on the screen while
   * the assets load. After loading, animations are
   * loaded using animations() and the splash scene
   * is started.
   */
  constructor() {
    super( "bootScreen" );

    // Gets cat demon image that was loaded in the config
    Phaser.Scene.call( this, {
      key: 'preloader',
      pack: {
        files: [ {
          type: 'image',
          key: 'rotate',
          url: 'assets/images/catDemon.png'
        } ]
      }
    } );
  }

  preload() {
    // Runs update() manually because it doesn't run normally while preload() hasn't finished
    this.sys.sceneUpdate = this.update;

    // Adds spinning cat demon to centre of screen while assets load
    this.image = this.add.image( this.cameras.main.centerX, this.cameras.main.centerY, "rotate" ).setOrigin( 0.5 );

    // Loads animations then starts splash screen and audio scene when assets have finished loading
    this.load.once( 'complete', () => {
      animations( this );
      this.scene.start( 'audio' );
      this.scene.start( 'splashScreen' );
    } );

    /* -------------------------------------------------------------------------- */
    /*                                Asset Loading                               */
    /* -------------------------------------------------------------------------- */

    /* --------------------------------- Scenes --------------------------------- */

    // Splash 
    this.load.image( "splash_text", "assets/images/splash_text.png" );

    // Main menu
    this.load.image( "menu_background", "assets/images/menu_background.png" );

    this.load.spritesheet( "menu_background_stars_frames", "assets/spritesheets/menu_background_stars-Sheet.png", {
      frameWidth: 384,
      frameHeight: 216
    } );

    this.load.spritesheet( "menu_branchBird_frames", "assets/spritesheets/menu_branchBird-Sheet.png", {
      frameWidth: 384,
      frameHeight: 216
    } );

    this.load.spritesheet( "start_frames", "assets/spritesheets/start_spritesheet.png", {
      frameWidth: 16,
      frameHeight: 16
    } );

    this.load.spritesheet( "options_frames", "assets/spritesheets/options_spritesheet.png", {
      frameWidth: 16,
      frameHeight: 16
    } );

    this.load.spritesheet( "quit_frames", "assets/spritesheets/quit_spritesheet.png", {
      frameWidth: 16,
      frameHeight: 16
    } );

    this.load.spritesheet( "trophy_frames", "assets/spritesheets/trophy-Sheet.png", {
      frameWidth: 16,
      frameHeight: 16
    } );

    // Boss intro and boss fight
    this.load.image( "bossIntro", "assets/images/bossIntro.png" );
    this.load.image( "bossIntro_crazyBirdLady", "assets/images/bossIntro_crazyBirdLady.png" );
    this.load.image( "bossIntro_crazyBirdLady_text", "assets/images/bossIntro_crazyBirdLady_text.png" );

    this.load.image( "bossBarContainer", "assets/images/bossBarContainer.png" );
    this.load.image( "bossBar", "assets/images/bossBar.png" );

    this.load.image( "boss_text_crazyBirdLady", "assets/images/crazyBirdLady_text.png" );

    // Overlay
    this.load.spritesheet( "heart_frames", "assets/spritesheets/hearts-Sheet.png", {
      frameWidth: 15,
      frameHeight: 18,
    } );

    this.load.image( "feather_icon", "assets/images/featherIcon.png" );

    // Game Over
    this.load.image( 'gameOver_background', "assets/images/gameOver_background.png" );
    this.load.image( 'gameOver_text', "assets/images/gameOver_text.png" );
    this.load.image( 'gameOver_bird_dead', "assets/images/gameOver_bird_dead.png" );
    this.load.image( 'gameOver_clock', "assets/images/clock.png" );
    this.load.image( 'gameOver_skull', "assets/images/skull.png" );
    this.load.image( 'restartText', "assets/images/restartText.png" );
    this.load.image( 'exitText', "assets/images/exitText.png" );
    this.load.image( 'new_text', "assets/images/new_text.png" );

    // Numbers
    this.load.spritesheet( "number_frames", "assets/spritesheets/numbers.png", { // Regular numbers
      frameWidth: 16,
      frameHeight: 16
    } );

    this.load.spritesheet( "number_frames_2", "assets/spritesheets/numbers_2.png", { // White numbers with black outline
      frameWidth: 16,
      frameHeight: 18
    } );

    this.load.image( "colon", "assets/images/colon.png" );

    // Keyboard tips
    this.load.image( "enter_key", "assets/images/enter.png" );

    this.load.image( "confirm_text", "assets/images/confirm_text.png" );

    this.load.image( "esc_key", "assets/images/esc.png" );

    this.load.image( "escape_text", "assets/images/escape_text.png" );

    this.load.image( "arrowKeys_key", "assets/images/arrowKeys.png" );

    this.load.image( "select_text", "assets/images/select_text.png" );

    this.load.image( "back_text", "assets/images/back_text.png" );

    // Text
    this.load.image( "pressEnterText", "assets/images/pressEnter.png" );

    this.load.image( "bestRun_text", "assets/images/bestRun_text.png" );

    this.load.image( "totalRuns_text", "assets/images/totalRuns_text.png" );

    this.load.image( "start_text", "assets/images/start_text.png" );

    this.load.image( "options_text", "assets/images/options_text.png" );

    this.load.image( "quit_text", "assets/images/quit_text.png" );

    this.load.image( "areYouSure_text", "assets/images/areYouSure_text.png" );

    this.load.image( "yes_text", "assets/images/yes_text.png" );

    this.load.image( "no_text", "assets/images/no_text.png" );

    this.load.image( "resume_text", "assets/images/resume_text.png" );

    this.load.image( "exitGame_text", "assets/images/exitGame_text.png" );

    this.load.image( "options_title_text", "assets/images/options_title_text.png" );

    this.load.image( "music_text", "assets/images/music_text.png" );

    this.load.image( "sfx_text", "assets/images/SFX_text.png" );

    this.load.image( "unknown_text", "assets/images/unknown_text.png" );

    this.load.image( "arrowLeft_text", "assets/images/arrowLeft_text.png" );

    this.load.image( "arrowRight_text", "assets/images/arrowRight_text.png" );

    /* ------------------------------ Game Sprites ------------------------------ */

    // Player
    this.load.spritesheet( "birdHead_frames", "assets/spritesheets/birdHead-Sheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    } );

    this.load.spritesheet( "birdBodyDown_frames", "assets/spritesheets/birdBodyDown-Sheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    } );

    this.load.spritesheet( "birdBodyLeft_frames", "assets/spritesheets/birdBodyLeft-Sheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    } );

    this.load.spritesheet( "birdBodyUp_frames", "assets/spritesheets/birdBodyUp-Sheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    } );

    this.load.spritesheet( "birdBodyRight_frames", "assets/spritesheets/birdBodyRight-Sheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    } );

    this.load.image( "birdHurt", "assets/images/birdHurt.png" );

    this.load.spritesheet( "birdDie_frames", "assets/spritesheets/birdDie-Sheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    } );

    // Lasers
    this.load.spritesheet( "laser_frames", "assets/spritesheets/laser-Sheet.png", {
      frameWidth: 11,
      frameHeight: 11,
    } );

    this.load.spritesheet( "superLaser_start_frames", "assets/spritesheets/superLaser_start-Sheet.png", {
      frameWidth: 16,
      frameHeight: 17,
    } );

    this.load.spritesheet( "superLaser_middle_frames", "assets/spritesheets/superLaser_middle-Sheet.png", {
      frameWidth: 16,
      frameHeight: 17,
    } );

    this.load.spritesheet( "superLaser_end_frames", "assets/spritesheets/superLaser_end-Sheet.png", {
      frameWidth: 14,
      frameHeight: 23,
    } );

    // Cat demon
    this.load.image( "catDemon", "assets/images/catDemon.png" );

    this.load.spritesheet( "catDemonIdle_frames", "assets/spritesheets/catDemonIdle-Sheet.png", {
      frameWidth: 64,
      frameHeight: 64,
    } );

    this.load.spritesheet( "catDemonWalk_frames", "assets/spritesheets/catDemonWalk-Sheet.png", {
      frameWidth: 64,
      frameHeight: 64,
    } );

    this.load.spritesheet( "catDemonRun_frames", "assets/spritesheets/catDemonRun-Sheet.png", {
      frameWidth: 64,
      frameHeight: 64,
    } );

    this.load.spritesheet( "catDemonDie_frames", "assets/spritesheets/catDemonDie-Sheet.png", {
      frameWidth: 64,
      frameHeight: 64,
    } );

    // Lizard demon
    this.load.image( "lizardDemon", "assets/images/lizardDemon.png" );

    this.load.spritesheet( "lizardDemonIdle_frames", "assets/spritesheets/lizardDemonIdle-Sheet.png", {
      frameWidth: 96,
      frameHeight: 80,
    } );

    this.load.spritesheet( "lizardDemonAttack_frames", "assets/spritesheets/lizardDemonAttack-Sheet.png", {
      frameWidth: 96,
      frameHeight: 80,
    } );

    this.load.spritesheet( "lizardDemonDie_frames", "assets/spritesheets/lizardDemonDie-Sheet.png", {
      frameWidth: 96,
      frameHeight: 80,
    } );

    // Energy ball
    this.load.spritesheet( "energyBallFloat_frames", "assets/spritesheets/energyBallFloat-Sheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    } );

    this.load.spritesheet( "energyBallExplode_frames", "assets/spritesheets/energyBallExplode-Sheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    } );

    /* ---------------------------------- Boss ---------------------------------- */

    // Crazy Bird Lady
    this.load.spritesheet( "crazyBirdLady_idle_frames", "assets/spritesheets/crazyBirdLady_idle-Sheet.png", {
      frameWidth: 96,
      frameHeight: 96,
    } );

    this.load.spritesheet( "crazyBirdLady_chase_frames", "assets/spritesheets/crazyBirdLady_chase-Sheet.png", {
      frameWidth: 96,
      frameHeight: 96,
    } );

    this.load.spritesheet( "crazyBirdLady_rest_frames", "assets/spritesheets/crazyBirdLady_rest-Sheet.png", {
      frameWidth: 96,
      frameHeight: 96,
    } );

    this.load.spritesheet( "crazyBirdLady_changePhase_frames", "assets/spritesheets/crazyBirdLady_changePhase-Sheet.png", {
      frameWidth: 96,
      frameHeight: 96,
    } );

    this.load.spritesheet( "crazyBirdLady_sad_idle_frames", "assets/spritesheets/crazyBirdLady_sad_idle-Sheet.png", {
      frameWidth: 96,
      frameHeight: 96,
    } );

    this.load.spritesheet( "crazyBirdLady_sad_chase_frames", "assets/spritesheets/crazyBirdLady_sad_chase-Sheet.png", {
      frameWidth: 96,
      frameHeight: 96,
    } );

    this.load.spritesheet( "crazyBirdLady_sad_rest_frames", "assets/spritesheets/crazyBirdLady_sad_rest-Sheet.png", {
      frameWidth: 96,
      frameHeight: 96,
    } );

    this.load.spritesheet( "crazyBirdLady_summonAttack_frames", "assets/spritesheets/crazyBirdLady_summonAttack-Sheet.png", {
      frameWidth: 96,
      frameHeight: 96,
    } );


    this.load.spritesheet( "crazyBirdLady_die_frames", "assets/spritesheets/crazyBirdLady_die-Sheet.png", {
      frameWidth: 96,
      frameHeight: 96,
    } );

    // Net
    this.load.spritesheet( "net_frames", "assets/spritesheets/net-Sheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    } );

    // Good drawing
    this.load.spritesheet( "smoke_frames", "assets/spritesheets/smoke-Sheet.png", {
      frameWidth: 32,
      frameHeight: 32,
    } );

    this.load.image( "goodDrawing", "assets/images/eevee.png" );

    this.load.spritesheet( "goodDrawing_run_frames", "assets/spritesheets/eevee_run-Sheet.png", {
      frameWidth: 48,
      frameHeight: 32,
    } );

    this.load.spritesheet( "goodDrawing_die_frames", "assets/spritesheets/eevee_die-Sheet.png", {
      frameWidth: 48,
      frameHeight: 32,
    } );

    /* ---------------------------------- Sound --------------------------------- */

    // SFX
    this.load.audio( 'select', "assets/audio/select.wav" );
    this.load.audio( 'select_confirm', "assets/audio/select_confirm.wav" );

    this.load.audio( 'bird_hurt', "assets/audio/bird_hurt.ogg" );

    this.load.audio( 'laser_shoot_1', "assets/audio/laser_shoot_1.wav" );
    this.load.audio( 'laser_shoot_2', "assets/audio/laser_shoot_2.wav" );
    this.load.audio( 'laser_shoot_3', "assets/audio/laser_shoot_3.wav" );
    this.load.audio( 'laser_shoot_4', "assets/audio/laser_shoot_4.wav" );

    this.load.audio( 'laser_collide_1', "assets/audio/laser_collide_1.wav" );
    this.load.audio( 'laser_collide_2', "assets/audio/laser_collide_2.wav" );
    this.load.audio( 'laser_collide_3', "assets/audio/laser_collide_3.wav" );

    this.load.audio( 'super_laser_shoot', "assets/audio/super_laser_shoot.wav" );
    this.load.audio( 'super_laser_sustain', "assets/audio/super_laser_sustain.wav" );

    this.load.audio( 'hurt_1', "assets/audio/hurt_1.wav" );
    this.load.audio( 'hurt_2', "assets/audio/hurt_2.wav" );
    this.load.audio( 'hurt_3', "assets/audio/hurt_3.wav" );

    this.load.audio( 'catDemon_chase', "assets/audio/catDemon_chase.wav" );
    this.load.audio( 'catDemon_die', "assets/audio/catDemon_die.wav" );

    this.load.audio( 'lizardDemon_attack', "assets/audio/lizardDemon_attack.wav" );
    this.load.audio( 'lizardDemon_fire', "assets/audio/lizardDemon_fire.wav" );
    this.load.audio( 'energyBall_explode', "assets/audio/energyBall_explode.wav" );
    this.load.audio( 'lizardDemon_die', "assets/audio/lizardDemon_die.wav" );

    this.load.audio( 'crazyBirdLady_chase_1', "assets/audio/crazyBirdLady_chase_1.wav" );
    this.load.audio( 'crazyBirdLady_chase_2', "assets/audio/crazyBirdLady_chase_2.wav" );
    this.load.audio( 'crazyBirdLady_rest_1', "assets/audio/crazyBirdLady_rest_1.wav" );
    this.load.audio( 'crazyBirdLady_rest_2', "assets/audio/crazyBirdLady_rest_2.wav" );
    this.load.audio( 'crazyBirdLady_summon_goodDrawing', "assets/audio/crazyBirdLady_summon_goodDrawing.wav" );
    this.load.audio( 'crazyBirdLady_goodDrawing_die', "assets/audio/crazyBirdLady_goodDrawing_die.wav" );
    this.load.audio( 'crazyBirdLady_summon_net_1', "assets/audio/crazyBirdLady_summon_net_1.wav" );
    this.load.audio( 'crazyBirdLady_summon_net_2', "assets/audio/crazyBirdLady_summon_net_2.wav" );
    this.load.audio( 'crazyBirdLady_net_fallen', "assets/audio/crazyBirdLady_net_fallen.wav" );
    this.load.audio( 'crazyBirdLady_die', "assets/audio/crazyBirdLady_die.wav" );

    this.load.audio( 'pickup_drop', "assets/audio/pickup_drop.wav" );
    this.load.audio( 'pickup_seed', "assets/audio/pickup_seed.wav" );
    this.load.audio( 'pickup_feather', "assets/audio/pickup_feather.wav" );

    this.load.audio( 'feather_use', "assets/audio/feather_use.wav" );

    this.load.audio( 'boss_intro', "assets/audio/Bike Horn.mp3" ); // www.soundbible.com

    // Loads 12 fart sfx files
    for ( let i = 1; i < 13; i++ ) { // www.soundbible.com
      let key = 'fart_' + i;
      let url = "assets/audio/" + key + '.wav';
      this.load.audio( key, url );
    }

    // Music
    this.load.audio( 'splash', "assets/audio/Feelin' Good.mp3" ); // www.purple-planet.com
    this.load.audio( 'menu', "assets/audio/bensound-love.mp3" ); // www.bensound.com
    this.load.audio( 'dungeon', "assets/audio/Frantic-Gameplay.mp3" ); // www.soundimage.org
    this.load.audio( 'boss_fight', "assets/audio/bensound-littleidea.mp3" ); // www.bensound.com
    this.load.audio( 'boss_dead', "assets/audio/Merry Go.mp3" ); // Kevin Macleod
    this.load.audio( 'gameOver', "assets/audio/bensound-jazzcomedy.mp3" ); // www.bensound.com
    this.load.audio( 'fart', "assets/audio/Farty-McSty.mp3" ); // www.soundimage.org

    /* ---------------------------------- Other --------------------------------- */

    // Drops
    this.load.spritesheet( "drop_frames", "assets/spritesheets/drop-Sheet.png", {
      frameWidth: 16,
      frameHeight: 16,
    } );

    // 16x16 and 32x32 tilesheet
    this.load.image( "tilesheet", "assets/spritesheets/tileset.png" );
    this.load.image( "tilesheet32", "assets/spritesheets/tileset32.png" );

    // JSON File
    if (fs.existsSync("./info.json")) {
      this.load.json( "info", "info.json" );
    } else {
      this.makeNewJSON()
    }
  }

  update() {
    // Spins image around
    this.image.rotation += 0.01;
  }

  makeNewJSON() {
    let json = JSON.stringify({
      "bestRun": {
        "score": 0,
        "time": "00:00:00"
      },
      "totalRuns": 0,
      "options": {
        "music": 50,
        "sfx": 50,
        "unknown": 0
      }
    })
    fs.writeFile("info.json", json, (err) => err && console.error(err));
    this.load.json("info", "info.json");
  }
}