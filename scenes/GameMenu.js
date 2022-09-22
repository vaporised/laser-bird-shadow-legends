class GameMenu extends Phaser.Scene {
  /**
   * The game menu/title screen.
   * 
   * Allows the player to exit, start the game,
   * change options and view their highscore.
   */
  constructor() {
    super( "gameMenu" );

    // Record containing details about each navigation option
    this.navOptions = {
      start: {
        title: "Start",
        sprite: null,
        variable: null
      },
      options: {
        title: "Options",
        sprite: null,
        variable: null
      },
      quit: {
        title: "Quit",
        sprite: null,
        variable: null
      }
    };

    // Array containing keys of this.navOption's records to make access easier
    this.navArray = [ 'start', 'options', 'quit' ];
    this.navNum = this.navArray.length;
  }

  create() {
    // Selection is set to 1 when scene is initialised
    this.currentSelection = 1;

    this.addKeys();
    this.changeSelection();
    this.createBackground();
    this.createElements();
    this.createMainMenuSprites();
    this.createKeyboardTips();
    this.getJSONInfo();
    this.checkIfFart();
    this.displayRunDetails();
    this.createTweens();
  }

  update() {
    this.updateOptions();
    this.menuEnter();
    this.menuExit();
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
   * Plays a music track if the track is not already playing, or fart sounds 
   * are on, because the fart music automatically gets changed to the fart track.
   */
  checkIfFart() {
    if ( this.jsonDetails.options.unknown == 69 ) {
      this.scene.get( 'audio' ).fartSounds = true;
    } else {
      this.scene.get( 'audio' ).fartSounds = false;
    }
    if ( !this.scene.get( 'audio' ).music_menu.isPlaying || this.scene.get( 'audio' ).fartSounds == true ) {
      this.scene.get( 'audio' ).playMusic( 'menu' );
    }
  }

  /**
   * Adds keys that will be used in the scene.
   */
  addKeys() {
    this.keyEnter = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ENTER );
    this.keyEscape = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ESC );
    this.keyUp = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.UP );
    this.keyDown = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.DOWN );
  }

  /**
   * Creates the background and animated sprites
   */
  createBackground() {
    this.add.image( 0, 0, 'menu_background' ).setOrigin( 0 );
    this.add.sprite( 0, 0, 'menu_background_stars_frames' ).setOrigin( 0 ).anims.play( 'menu_background_stars' );
    this.add.sprite( 0, 0, 'menu_branchBird_frames' ).setOrigin( 0 ).anims.play( 'menu_background_bird' );
  }

  /**
   * Creates navigation elements.
   */
  createElements() {
    const x = 65;
    const y = 130;
    const gap = 30; // Gap between each option

    for ( let i = 0; i < this.navNum; i++ ) {
      let arrayName = this.navArray[ i ];
      let textureName = arrayName + '_text';
      this.navOptions[ arrayName ].variable = this.add.sprite( x, y + gap * i, textureName ).setOrigin( 0, 0.5 );
    }

    // Moves 'options' option down slightly because the 'p' affects the origin
    this.navOptions.options.variable.y += 2;
  }

  /**
   * Displays saved player run info on the top right corner of the scene.
   */
  displayRunDetails() {
    const x = 280;
    const y = 15;
    const gap = 16; // Gap between the title and actual number for each displayed piece of info

    this.displayBestRun( x, y, gap );
    this.displayTotalRuns( x, y + 36, gap );
  }

  /**
   * Displays the player's best run score and time.
   */
  displayBestRun( x, y, gap ) {
    this.bestContainer = this.add.container( x, y );

    // Text and animated trophy sprite that shines every 2 seconds
    var bestRunText = this.add.sprite( -5, 0, 'bestRun_text' ).setOrigin( 0, 0.5 );
    var trophy = this.add.sprite( -21, 0, 'trophy_frames' ).setOrigin( 0, 0.5 );
    this.time.addEvent( {
      delay: 2000,
      callback: () => trophy.anims.play( 'trophy_shine' ),
      loop: true
    } );
    trophy.on( 'animationcomplete', () => trophy.setFrame( 0 ) ); // Resets trophy texture to regular texture after animation

    // Adds text and sprite to container
    this.bestContainer.add( [ bestRunText, trophy ] );

    this.displayScore( gap );
    this.displayTime( gap );
  }

  /**
   * Displays the player's score.
   */
  displayScore( gap ) {
    var score = this.jsonDetails.bestRun.score;

    // Adds number sprites
    for ( let i = 1; i <= 6; i++ ) {
      var name = 'scoreDigit' + i;
      var x = ( i - 1 ) * 7; // Changes x-value of sprite depending on i
      this[ name ] = this.add.sprite( x, gap, 'number_frames_2' ).setOrigin( 0, 0.5 ).setScale( 0.5 );
      this.bestContainer.add( this[ name ] );
    }

    // Changes frames of number sprites to display the score
    // Starts from the end to the front
    for ( let i = 0; i < 6; i++ ) {
      var stringRef = 'scoreDigit' + String( 6 - i );
      if ( score <= 0 ) { // Sets the digit to 0 if the score is already displayed
        this[ stringRef ].setFrame( 0 );
      }
      var digit = score % 10; // Gets the last digit of the remaining score
      this[ stringRef ].setFrame( digit ); // Sets frame to the digit
      score = ( score - digit ) / 10; // Removes the last digit of the score
    }
  }

  /**
   * Displays the time of the best run.
   */
  displayTime( gap ) {
    var time = this.jsonDetails.bestRun.time;
    time = time.split( ':' ).join( '' ); // Reformats the time to form one integer

    var x = 48; // x-value of the first number

    for ( let i = 1; i <= 6; i++ ) {
      if ( i == 3 ) { // Adds colon before third number
        let name = 'colon1';
        this[ name ] = this.add.sprite( x + 1, gap, 'colon' ).setOrigin( 0, 0.5 ).setScale( 0.5 ).setTintFill( 0xffffff );
        this.bestContainer.add( this[ name ] );
        x += 2;
      } else if ( i == 5 ) { // Adds colon before fifth number
        let name = 'colon2';
        this[ name ] = this.add.sprite( x + 1, gap, 'colon' ).setOrigin( 0, 0.5 ).setScale( 0.5 ).setTintFill( 0xffffff );
        this.bestContainer.add( this[ name ] );
        x += 2;
      }

      // Adds number sprite and sets frame
      let name = 'time' + i;
      this[ name ] = this.add.sprite( x, gap, 'number_frames_2' ).setOrigin( 0, 0.5 ).setScale( 0.5 ).setFrame( time[ i - 1 ] );
      this.bestContainer.add( this[ name ] );
      x += 7;
    }
  }

  /**
   * Displays the total number of runs the player has started.
   */
  displayTotalRuns( x, y, gap ) {
    var runs = this.jsonDetails.totalRuns;
    this.totalContainer = this.add.container( x, y );

    // Adds 'Total runs' text
    var totalRunsText = this.add.sprite( -5, 0, 'totalRuns_text' ).setOrigin( 0, 0.5 );
    this.totalContainer.add( totalRunsText );

    // Adds number sprites
    for ( let i = 1; i <= 4; i++ ) {
      var name = 'runDigit' + i;
      var runX = ( i - 1 ) * 7;
      this[ name ] = this.add.sprite( runX, gap, 'number_frames_2' ).setOrigin( 0, 0.5 ).setScale( 0.5 );
      this.totalContainer.add( this[ name ] );
    }

    // Changes frame to the respective digits by getting digits from right to left
    for ( let i = 0; i < 4; i++ ) {
      var stringRef = 'runDigit' + String( 4 - i );
      if ( runs <= 0 ) {
        this[ stringRef ].setFrame( 0 );
      }
      var digit = runs % 10;
      this[ stringRef ].setFrame( digit );
      runs = ( runs - digit ) / 10;
    }
  }

  /**
   * Creates animated sprites next to each navigation option
   */
  createMainMenuSprites() {
    Phaser.Utils.Array.Each( this.navArray, ( name ) => {
      let framesName = name + '_frames';
      this.navOptions[ name ].sprite = this.add.sprite( this.navOptions[ name ].variable.x - 15, this.navOptions[ name ].variable.y, framesName ).setOrigin( 0.5 );
    } );
  }

  /**
   * Makes the run details and keyboard tips move up and down.
   */
  createTweens() {
    this.tweens.add( {
      targets: [ this.enterContainer, this.escapeContainer, this.bestContainer, this.totalContainer ],
      y: '-=1',
      yoyo: true,
      repeat: -1,
      repeatDelay: 150,
      duration: 120,
      ease: 'Stepped',
      easeParams: [ 1 ]
    } );
  }

  /**
   * Changes navigation selection on keyboard input.
   */
  changeSelection() {
    this.keyUp.on( 'down', () => {
      if ( this.currentSelection != 1 ) { // Prevents user from going above the first option
        this.currentSelection--;
        this.scene.get( 'audio' ).playSFX( 'select' );
      }
    } );
    this.keyDown.on( 'down', () => {
      if ( this.currentSelection != this.navNum ) { // Prevents user from going below the last option
        this.currentSelection++;
        this.scene.get( 'audio' ).playSFX( 'select' );
      }
    } );
  }

  /**
   * Adds keyboard tip sprites to the scene.
   */
  createKeyboardTips() {
    const y = 200;
    this.enterContainer = this.add.container( 250, y );
    this.escapeContainer = this.add.container( 317, y );

    var enterSprite = this.add.sprite( 0, 0, 'enter_key' ).setOrigin( 0, 0.5 );
    var confirmSprite = this.add.sprite( 20, 0, 'confirm_text' ).setOrigin( 0, 0.5 );
    this.enterContainer.add( [ enterSprite, confirmSprite ] );

    var escSprite = this.add.sprite( 0, 0, 'esc_key' ).setOrigin( 0, 0.5 );
    var escapeSprite = this.add.sprite( 22, 0, 'escape_text' ).setOrigin( 0, 0.5 );
    this.escapeContainer.add( [ escSprite, escapeSprite ] );
  }

  /**
   * Updates the selected navigation option.
   * 
   * Changes the colour of options depending on what is selected.
   * Plays sprite animations of selected option.
   */
  updateOptions() {
    // Deselected options are black and their animated sprites are paused
    for ( let i = 0; i < this.navNum; i++ ) {
      this.navOptions[ this.navArray[ i ] ].variable.setTintFill( 0x000000 );
      if ( this.currentSelection != ( i + 1 ) ) {
        this.navOptions[ this.navArray[ i ] ].sprite.anims.pause().setFrame( 0 );
      }
    }

    // Changes selected option to white and animates the sprite
    switch ( this.currentSelection ) {
      case 1:
        this.navOptions.start.variable.setTintFill( 0xffffff );
        this.navOptions.start.sprite.anims.play( 'start', true, 1 );
        break;
      case 2:
        this.navOptions.options.variable.setTintFill( 0xffffff );
        this.navOptions.options.sprite.anims.play( 'options', true, 1 );
        break;
      case 3:
        this.navOptions.quit.variable.setTintFill( 0xffffff );
        this.navOptions.quit.sprite.play( 'quit', true, 1 );
        break;
    }
  }

  /**
   * Does things when enter is pressed on a selection.
   * 
   * Start: Starts a new game
   * Options: Runs options scene
   * Quit: Runs confirmation scene
   */
  menuEnter() {
    if ( Phaser.Input.Keyboard.JustDown( this.keyEnter ) ) {
      this.scene.get( 'audio' ).playSFX( 'select_confirm' );
      switch ( this.currentSelection ) {
        case 1: // Start
          this.scene.sleep();
          this.keyUp.destroy();
          this.keyDown.destroy();
          this.keyEnter.destroy();
          this.keyEscape.destroy();
          this.scene.start( 'game', {
            level: 1
          } );
          break;
        case 2: // Options
          this.scene.sleep();
          this.input.keyboard.resetKeys();
          this.scene.run( 'options', {
            from: 'gameMenu'
          } );
          break;
        case 3: // Quit
          this.scene.pause();
          this.input.keyboard.resetKeys();
          this.scene.run( 'exitConfirm', {
            from: 'gameMenu'
          } );
          break;
      }
    }
  }

  /**
   * Escapes to splash screen when 'escape' is pressed.
   */
  menuExit() {
    if ( Phaser.Input.Keyboard.JustDown( this.keyEscape ) ) {
      this.scene.stop();
      this.keyUp.destroy();
      this.keyDown.destroy();
      this.keyEnter.destroy();
      this.keyEscape.destroy();
      this.scene.get( 'audio' ).playSFX( 'select_confirm' );
      this.scene.run( 'splashScreen' );
    }
  }
}