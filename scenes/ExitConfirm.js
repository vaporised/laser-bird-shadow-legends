class ExitConfirm extends Phaser.Scene {
  /**
   * A confirmation screen that allows the player to
   * confirm if they would like to perform an important
   * action.
   * 
   * Asks if the player is sure that they want to do something, 
   * and allows them to choose to continue or return.
   */
  constructor() {
    super( 'exitConfirm' );

    // Record of navigation options with details
    this.navOptions = {
      yes: {
        title: "Yes",
        y: 128,
        variable: null
      },
      no: {
        title: "No",
        y: 148,
        variable: null
      }
    };

    // Array of navigation option keys to make access easier
    this.navArray = [ 'yes', 'no' ];
    this.navNum = this.navArray.length;
  }

  init( data ) {
    // Passes the name of the scene from which this scene was called
    this.from = data.from;
  }

  create() {
    // Selection is the first option when scene is initialised
    this.currentSelection = 1;

    this.darkenBackground();
    this.createText();
    this.addKeys();
    this.createElements();
    this.changeSelection();
  }

  update() {
    this.updateOptionSelection();
    this.confirmEnter();
    this.confirmEscape();
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Adds keys that are used to navigate the scene.
   */
  addKeys() {
    this.keyEnter = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ENTER );
    this.keyEscape = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ESC );
    this.keyUp = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.UP );
    this.keyDown = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.DOWN );
  }

  /**
   * Creates "Are you sure?" text in scene.
   */
  createText() {
    this.add.image( this.cameras.main.centerX, 100, "areYouSure_text" ).setOrigin( 0.5 );
  }

  /**
   * Creates navigation elements in scene.
   * 
   * Uses navArray array to access the keys of the records in the navOptions record.
   */
  createElements() {
    Phaser.Utils.Array.Each( this.navArray, ( name ) => {
      let textureName = name + '_text';
      this.navOptions[ name ].variable = this.add.sprite( this.cameras.main.centerX, this.navOptions[ name ].y, textureName ).setOrigin( 0.5 );
    } );
  }

  /**
   * Darkens the background of the scene with a translucent rectangle.
   */
  darkenBackground() {
    this.add.rectangle( 0, 0, 768, 432, 0x000000, 0.8 );
  }

  /**
   * Changes the option selection on keyboard input.
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
  updateOptionSelection() {
    for ( let i = 0; i < this.navNum; i++ ) {
      this.navOptions[ this.navArray[ i ] ].variable.setTintFill( 0x424242 ); // Grey
    }

    // White when selected
    switch ( this.currentSelection ) {
      case 1:
        this.navOptions.yes.variable.setTintFill( 0xffffff );
        break;
      case 2:
        this.navOptions.no.variable.setTintFill( 0xffffff );
        break;
    }
  }

  /**
   * Does certain things when 'enter' is pressed on a certain selection.
   * 
   * Does different things depending on which scene this scene was created from.
   */
  confirmEnter() {
    if ( Phaser.Input.Keyboard.JustDown( this.keyEnter ) ) {
      this.scene.stop();
      this.input.keyboard.resetKeys();
      this.scene.get( 'audio' ).playSFX( 'select_confirm' );
      switch ( this.currentSelection ) {
        case 1: // Yes
          if ( this.from == 'pause' ) {
            // Quits to main menu 
            this.scene.stop( 'pause' );
            this.scene.stop( 'game' );
            this.scene.stop( 'overlay' );
            this.scene.run( 'gameMenu' );
          } else if ( this.from == 'gameMenu' ) {
            // Closes game
            w.close();
          }
          break;
        case 2: // No
          if ( this.from == 'pause' ) {
            // Returns to pause menu
            this.scene.resume( 'pause' );
          } else if ( this.from == 'gameMenu' ) {
            // Returns to main menu 
            this.scene.resume( 'gameMenu' );
          }
          break;
      }
    }
  }

  /**
   * Returns to previous scene when escape is pressed.
   */
  confirmEscape() {
    if ( Phaser.Input.Keyboard.JustDown( this.keyEscape ) ) {
      this.scene.stop();
      this.scene.get( 'audio' ).playSFX( 'select_confirm' );
      if ( this.from == 'pause' ) {
        this.scene.resume( 'pause' );
      } else {
        this.scene.resume( 'gameMenu' );
      }
    }
  }

}