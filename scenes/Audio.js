class Audio extends Phaser.Scene {
  /** 
   * Controls sound in game.
   * 
   * Runs throughout the entire life of the program starting from the splash screen, 
   * has functions called by other scenes to play sounds. Replaces all sound effects
   * with randomly selected fart sounds and every music track with a fart themed
   * track if this.fartSounds is true.
   * */
  constructor() {
    super( 'audio' );

    this.fartSounds = false;
  }

  create() {
    this.addSFX();
    this.addMusic();
    this.initialiseVolume();
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /** 
   * Pauses all sound in program, called via other scenes.
   */
  pause() {
    this.sound.pauseAll();
  }

  /**
   * Resumes playing any sounds that have been paused, called via other scenes.
   */
  resume() {
    this.sound.resumeAll();
  }

  /**
   * Stops all currently playing sounds, called via other scenes.
   */
  stop() {
    this.stopSounds();
  }

  /**
   * Sets the volume of SFX and music using saved values from info.json.
   */
  initialiseVolume() {
    // Get options record from info.json
    var jsonDetails = this.cache.json.get( 'info' ).options;

    // Converts the input range of 0-100 to a range of 0-2 for the actual volume and 
    // loops through all sound objects in respective arrays and sets volume for each 
    this.musicVolume = jsonDetails.music / 50;
    Phaser.Utils.Array.Each( this.musicArray, ( sound ) => {
      sound.setVolume( this.musicVolume );
    } );

    this.sfxVolume = jsonDetails.sfx / 50;
    Phaser.Utils.Array.Each( this.sfxArray, ( sound ) => {
      sound.setVolume( this.sfxVolume );
    } );
  }

  /**
   * Updates volume of SFX or music.
   * 
   * Converts given volume value to a range from 0-2 and loops 
   * through given array to set new volume.
   */
  updateVolume( arrayName, volume ) {
    var decimalVolume = volume / 50;
    Phaser.Utils.Array.Each( this[ arrayName ], function ( sound ) {
      sound.setVolume( decimalVolume );
    }, this );
    if ( arrayName == 'sfxArray' ) {
      this.sfxVolume = volume / 50;
    } else if ( arrayName == 'musicArray' ) {
      this.musicVolume = volume / 50;
    }
  }

  /**
   * Plays SFX of key passed into function.
   * 
   * If this.fartSounds is true, plays a random fart SFX instead
   * of what was going to be played. If the sound effect is already
   * being played, creates a new temporary sound.
   */
  playSFX( key ) {
    if ( this.fartSounds ) {
      let randNum = Phaser.Math.Between( 1, 12 );
      let varName = 'sfx_fart_' + randNum;
      if ( this[ varName ].isPlaying ) { // Check if fart sound already playing
        let fartKey = 'fart_' + randNum;
        this.sound.play( fartKey, {
          volume: this.sfxVolume
        } );
      } else {
        this[ varName ].play();
      }
    } else {
      let varName = 'sfx_' + key;
      if ( this[ varName ].isPlaying ) { // Check if sound already playing
        this.sound.play( key, {
          volume: this.sfxVolume
        } );
      } else {
        this[ varName ].play();
      }
    }
  }

  /**
   * Plays music of key passed into function after stopping any currently playing music.
   * 
   * If this.fartSounds is true, plays a fart themed music track
   * instead. Doesn't start a track again if the track is already playing.
   */
  playMusic( key ) {
    if ( this.fartSounds ) {
      if ( this.music_fart.isPlaying ) {
        return;
      } else {
        this.stopSounds();
        this.music_fart.play();
      }
    } else {
      let varName = 'music_' + key;
      if ( this[ varName ].isPlaying ) {
        return;
      } else {
        this.stopSounds();
        this[ varName ].play();
      }
    }
  }

  /**
   * Stops playback of almost every sound.
   * 
   * Prevents the 'select confirm' sound from being stopped.
   */
  stopSounds() {
    Phaser.Utils.Array.Each( this.sfxArray, ( sfx ) => {
      if ( sfx != this.sfx_select_confirm ) {
        sfx.stop();
      }
    } );
    Phaser.Utils.Array.Each( this.musicArray, ( music ) => {
      music.stop();
    } );
  }

  /**
   * Selects a random enemy hurt sound effect to play.
   */
  randomHurt() {
    var randNum = Phaser.Math.Between( 1, 3 );
    var name = 'hurt_' + randNum;
    this.playSFX( name );
  }

  /**
   * Selects a random laser shooting sound effect to play.
   */
  randomLaserShoot() {
    var randNum = Phaser.Math.Between( 1, 4 );
    var name = 'laser_shoot_' + randNum;
    this.playSFX( name );
  }

  /**
   * Selects a random laser collision sound effect to play.
   */
  randomLaserCollide() {
    var randNum = Phaser.Math.Between( 1, 3 );
    var name = 'laser_collide_' + randNum;
    this.playSFX( name );
  }

  /**
   * Adds SFX to scene and pushes them into an array.
   */
  addSFX() {
    this.sfxArray = [];

    this.sfx_select = this.sound.add( 'select' );
    this.sfxArray.push( this.sfx_select );

    this.sfx_select_confirm = this.sound.add( 'select_confirm' );
    this.sfxArray.push( this.sfx_select_confirm );

    this.sfx_bird_hurt = this.sound.add( 'bird_hurt' );
    this.sfxArray.push( this.sfx_bird_hurt );

    this.sfx_bird_hurt = this.sound.add( 'bird_hurt' );
    this.sfxArray.push( this.sfx_bird_hurt );

    this.sfx_laser_shoot_1 = this.sound.add( 'laser_shoot_1' );
    this.sfxArray.push( this.sfx_laser_shoot_1 );

    this.sfx_laser_shoot_2 = this.sound.add( 'laser_shoot_2' );
    this.sfxArray.push( this.sfx_laser_shoot_2 );

    this.sfx_laser_shoot_3 = this.sound.add( 'laser_shoot_3' );
    this.sfxArray.push( this.sfx_laser_shoot_3 );

    this.sfx_laser_shoot_4 = this.sound.add( 'laser_shoot_4' );
    this.sfxArray.push( this.sfx_laser_shoot_4 );

    this.sfx_laser_collide_1 = this.sound.add( 'laser_collide_1' );
    this.sfxArray.push( this.sfx_laser_collide_1 );

    this.sfx_laser_collide_2 = this.sound.add( 'laser_collide_2' );
    this.sfxArray.push( this.sfx_laser_collide_2 );

    this.sfx_laser_collide_3 = this.sound.add( 'laser_collide_3' );
    this.sfxArray.push( this.sfx_laser_collide_3 );

    this.sfx_super_laser_shoot = this.sound.add( 'super_laser_shoot' );
    this.sfxArray.push( this.sfx_super_laser_shoot );

    this.sfx_super_laser_sustain = this.sound.add( 'super_laser_sustain', { // Loops until the player lifts the firing keys
      loop: true
    } );
    this.sfxArray.push( this.sfx_super_laser_sustain );

    this.sfx_hurt_1 = this.sound.add( 'hurt_1' );
    this.sfxArray.push( this.sfx_hurt_1 );

    this.sfx_hurt_2 = this.sound.add( 'hurt_2' );
    this.sfxArray.push( this.sfx_hurt_2 );

    this.sfx_hurt_3 = this.sound.add( 'hurt_3' );
    this.sfxArray.push( this.sfx_hurt_3 );

    this.sfx_catDemon_chase = this.sound.add( 'catDemon_chase' );
    this.sfxArray.push( this.sfx_catDemon_chase );

    this.sfx_catDemon_die = this.sound.add( 'catDemon_die' );
    this.sfxArray.push( this.sfx_catDemon_die );

    this.sfx_lizardDemon_attack = this.sound.add( 'lizardDemon_attack' );
    this.sfxArray.push( this.sfx_lizardDemon_attack );

    this.sfx_lizardDemon_fire = this.sound.add( 'lizardDemon_fire' );
    this.sfxArray.push( this.sfx_lizardDemon_fire );

    this.sfx_energyBall_explode = this.sound.add( 'energyBall_explode' );
    this.sfxArray.push( this.sfx_energyBall_explode );

    this.sfx_lizardDemon_die = this.sound.add( 'lizardDemon_die' );
    this.sfxArray.push( this.sfx_lizardDemon_die );

    this.sfx_crazyBirdLady_chase_1 = this.sound.add( 'crazyBirdLady_chase_1' );
    this.sfxArray.push( this.sfx_crazyBirdLady_chase_1 );

    this.sfx_crazyBirdLady_chase_2 = this.sound.add( 'crazyBirdLady_chase_2' );
    this.sfxArray.push( this.sfx_crazyBirdLady_chase_2 );

    this.sfx_crazyBirdLady_rest_1 = this.sound.add( 'crazyBirdLady_rest_1' );
    this.sfxArray.push( this.sfx_crazyBirdLady_rest_1 );

    this.sfx_crazyBirdLady_rest_2 = this.sound.add( 'crazyBirdLady_rest_2' );
    this.sfxArray.push( this.sfx_crazyBirdLady_rest_2 );

    this.sfx_crazyBirdLady_summon_goodDrawing = this.sound.add( 'crazyBirdLady_summon_goodDrawing' );
    this.sfxArray.push( this.sfx_crazyBirdLady_summon_goodDrawing );

    this.sfx_crazyBirdLady_goodDrawing_die = this.sound.add( 'crazyBirdLady_goodDrawing_die' );
    this.sfxArray.push( this.sfx_crazyBirdLady_goodDrawing_die );

    this.sfx_crazyBirdLady_summon_net_1 = this.sound.add( 'crazyBirdLady_summon_net_1' );
    this.sfxArray.push( this.sfx_crazyBirdLady_summon_net_1 );

    this.sfx_crazyBirdLady_summon_net_2 = this.sound.add( 'crazyBirdLady_summon_net_2' );
    this.sfxArray.push( this.sfx_crazyBirdLady_summon_net_2 );

    this.sfx_crazyBirdLady_net_fallen = this.sound.add( 'crazyBirdLady_net_fallen' );
    this.sfxArray.push( this.sfx_crazyBirdLady_net_fallen );

    this.sfx_crazyBirdLady_die = this.sound.add( 'crazyBirdLady_die' );
    this.sfxArray.push( this.sfx_crazyBirdLady_die );

    this.sfx_pickup_drop = this.sound.add( 'pickup_drop' );
    this.sfxArray.push( this.sfx_pickup_drop );

    this.sfx_pickup_seed = this.sound.add( 'pickup_seed' );
    this.sfxArray.push( this.sfx_lizardDemon_die );

    this.sfx_pickup_feather = this.sound.add( 'pickup_feather' );
    this.sfxArray.push( this.sfx_pickup_feather );

    this.sfx_feather_use = this.sound.add( 'feather_use' );
    this.sfxArray.push( this.sfx_feather_use );

    this.sfx_boss_intro = this.sound.add( 'boss_intro' );
    this.sfxArray.push( this.sfx_boss_intro );

    // Adds all 12 fart SFX files to the scene and pushes them into the array.
    for ( let i = 1; i < 13; i++ ) {
      let key = 'fart_' + i;
      let varName = 'sfx_' + key;
      this[ varName ] = this.sound.add( key );
      this.sfxArray.push( this[ varName ] );
    }
  }

  /**
   * Adds music to scene and pushes them into an array.
   */
  addMusic() {
    this.musicArray = [];

    this.music_splash = this.sound.add( 'splash', {
      loop: true
    } );
    this.musicArray.push( this.music_splash );

    this.music_menu = this.sound.add( 'menu', {
      loop: true
    } );
    this.musicArray.push( this.music_menu );

    this.music_dungeon = this.sound.add( 'dungeon', {
      loop: true
    } );
    this.musicArray.push( this.music_dungeon );

    this.music_boss_fight = this.sound.add( 'boss_fight', {
      loop: true
    } );
    this.musicArray.push( this.music_boss_fight );

    this.music_boss_dead = this.sound.add( 'boss_dead', {
      loop: true
    } );
    this.musicArray.push( this.music_boss_dead );

    this.music_gameOver = this.sound.add( 'gameOver', {
      loop: true
    } );
    this.musicArray.push( this.music_gameOver );

    this.music_fart = this.sound.add( 'fart', {
      loop: true
    } );
    this.musicArray.push( this.music_fart );
  }
}