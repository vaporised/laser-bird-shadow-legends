class Pause extends Phaser.Scene {
  /**
   * Pause scene that appears when the player presses 'enter' in game.
   * 
   * Player can either resume the game, open the options scene or quit to the main menu.
   */
  constructor() {
    super( 'pause' );

    // Record of record of navigation option data
    this.navOptions = {
      resume: {
        title: "Resume",
        y: 83,
        variable: null
      },
      options: {
        title: "Options",
        y: 108,
        variable: null
      },
      exitGame: {
        title: "Exit Game",
        y: 133,
        variable: null
      }
    };

    // Array of the keys of the records in the main record
    this.navArray = [ 'resume', 'options', 'exitGame' ];
    this.navNum = this.navArray.length;
  }

  create() {
    // The selection starts on 'resume'
    this.currentSelection = 1;

    this.addKeys();
    this.reduceOpacity();
    this.createElements();
    this.changeSelection();
  }

  update() {
    this.updateSelection();
    this.pauseEnter();
    this.pauseEscape();
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Adds keys that will be used to navigate the scene.
   */
  addKeys() {
    this.keyEnter = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ENTER );
    this.keyEscape = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ESC );
    this.keyUp = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.UP );
    this.keyDown = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.DOWN );
  }

  /**
   * Darkens the background of the scene.
   * 
   * Uses a translucent rectangle to reduce visibility of the game.
   */
  reduceOpacity() {
    this.add.rectangle( 0, 0, 384, 216, 0x000000, 0.8 ).setOrigin( 0 );
  }

  /**
   * Creates the navigation elements of the scene.
   */
  createElements() {
    Phaser.Utils.Array.Each( this.navArray, ( name ) => {
      let textureName = name + '_text';
      this.navOptions[ name ].variable = this.add.sprite( this.cameras.main.centerX, this.navOptions[ name ].y, textureName ).setOrigin( 0.5 );
    } );

    // Shifts two options down slightly due to centring issues
    this.navOptions.options.variable.y += 4;
    this.navOptions.exitGame.variable.y += 4;
  }

  /**
   * Changes the current selected option when the player presses 'up' or 'down'.
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
   * Changes the colours of the navigation options when selected/deselected.
   */
  updateSelection() {
    Phaser.Utils.Array.Each( this.navArray, ( name ) => {
      this.navOptions[ name ].variable.setTintFill( 0x424242 ); // Grey initially
    } );

    // Changes colour of selected option to white
    switch ( this.currentSelection ) {
      case 1:
        this.navOptions.resume.variable.setTintFill( 0xffffff );
        break;
      case 2:
        this.navOptions.options.variable.setTintFill( 0xffffff );
        break;
      case 3:
        this.navOptions.exitGame.variable.setTintFill( 0xffffff );
        break;
    }
  }

  /**
   * Does certain things when 'enter' is pressed on a certain selection.
   * 
   * Resume: Resumes the game
   * Options: Opens the options scene
   * Exit game: Opens confirmation scene
   */
  pauseEnter() {
    if ( Phaser.Input.Keyboard.JustDown( this.keyEnter ) ) {
      this.input.keyboard.resetKeys();
      this.scene.get( 'audio' ).playSFX( 'select' );
      switch ( this.currentSelection ) {
        case 1: // Resume
          this.scene.stop();
          this.destroyKeys();
          this.scene.get( 'game' ).checkIfFart();
          this.scene.get( 'game' ).totalTimeTimer.paused = false;
          this.scene.get( 'game' ).scoreDecreaseTimer.paused = false;
          this.scene.resume( 'overlay' );
          this.scene.resume( 'game' );
          break;
        case 2: // Options
          this.scene.sleep();
          this.scene.run( 'options', {
            from: 'pause'
          } );
          break;
        case 3: // Exit game
          this.scene.stop();
          this.destroyKeys();
          this.scene.run( 'exitConfirm', {
            from: 'pause'
          } );
          break;
      }
    }
  }

  /**
   * Returns to game when 'escape' is pressed.
   */
  pauseEscape() {
    if ( Phaser.Input.Keyboard.JustDown( this.keyEscape ) ) {
      this.scene.stop();
      this.destroyKeys();
      this.scene.get( 'audio' ).playSFX( 'select_confirm' );
      this.scene.get( 'game' ).checkIfFart();
      this.scene.get( 'game' ).totalTimeTimer.paused = false;
      this.scene.get( 'game' ).scoreDecreaseTimer.paused = false;
      this.scene.resume( 'overlay' );
      this.scene.resume( 'game' );
    }
  }

  /**
   * Destroys keys added in this scene.
   */
  destroyKeys() {
    this.keyEscape.destroy();
    this.keyEnter.destroy();
    this.keyUp.destroy();
    this.keyDown.destroy();
  }
}