class Splash extends Phaser.Scene {
  /**
   * Splash screen.
   * 
   * First scene to appear after the booting scene.
   * Pressing 'escape' closes the game, and pressing 
   * enter starts the game menu.
   */
  constructor() {
    super( "splashScreen" );
  }

  create() {
    this.getJSONInfo();
    this.checkIfFart();
    this.addKeys();
    this.createBackground();
    this.createText();
    this.menuStart();
    this.quitGame();
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Gets the record with saved information from info.json and assigns it to this.jsonDetails
   */
  getJSONInfo() {
    this.jsonDetails = this.cache.json.get( 'info' );
  }

  /**
   * If the '???' option is set to 69, all SFX are replaced with fart sounds
   * and the music track is replaced with a fart themed track.
   * 
   * Also plays menu music, which is changed to a fart track by the audio
   * scene if this.fartSounds is true.
   */
  checkIfFart() {
    if ( this.jsonDetails.options.unknown == 69 ) {
      this.scene.get( 'audio' ).fartSounds = true;
    } else {
      this.scene.get( 'audio' ).fartSounds = false;
    }
    this.scene.get( 'audio' ).playMusic( 'menu' );
  }

  /**
   * Adds keys that will be used in the scene.
   */
  addKeys() {
    this.keyEnter = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ENTER );
    this.keyEscape = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ESC );
  }

  /**
   * Creates the background and animated sprites
   */
  createBackground() {
    this.add.image( 0, 0, 'menu_background' ).setOrigin( 0 );
    this.add.sprite( 0, 0, 'menu_background_stars_frames' ).setOrigin( 0 ).anims.play( 'menu_background_stars' );
    // this.add.sprite( 0, 0, 'menu_branchBird_frames' ).setOrigin( 0 ).anims.play( 'menu_background_bird' );
  }

  /**
   * Creates text that moves up and down slowly.
   * 
   * Uses a tween with a trigonometric ease to make
   * movement smooth.
   */
  createText() {
    this.title = this.add.image( 0, 0, "splash_text" ).setOrigin( 0.5 );
    this.pressText = this.add.image( this.title.x, this.title.y + 55, 'pressEnterText' ).setOrigin( 0.5 );
    this.container = this.add.container( this.cameras.main.centerX, this.cameras.main.centerY - 30, [ this.title, this.pressText ] );

    // Makes the text bob up and down
    this.titleTween = this.tweens.add( {
      targets: this.container,
      props: {
        y: {
          value: this.cameras.main.centerY - 10,
          duration: 1500,
        }
      },
      ease: 'Sine.easeInOut',
      duration: 500,
      repeat: -1,
      yoyo: true
    } );
  }

  /**
   * Starts main menu when 'enter' is pressed.
   */
  menuStart() {
    this.keyEnter.once( 'down', () => {
      this.scene.get( 'audio' ).playSFX( 'select_confirm' );
      this.scene.start( 'gameMenu' );
    } );
  }

  /**
   * Closes window when 'escape' is pressed.
   */
  quitGame() {
    this.keyEscape.once( 'down', () => w.close() );
  }
}