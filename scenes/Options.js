class Options extends Phaser.Scene {
  /**
   * Options scene where the player can change options.
   * 
   * Player can change SFX and music volume.
   * Scene can be accessed from game menu and pause screen in game.
   */
  constructor() {
    super( "options" );

    // Record of option records containing related variables
    this.optionsOptions = {
      music: {
        title: "Music",
        variable: null,
        leftArrowVariable: null,
        rightArrowVariable: null,
        valueVariable1: null,
        valueVariable2: null,
        valueVariable3: null,
        value: 0,
        minVal: false,
        maxVal: false,
        y: 124
      },
      sfx: {
        title: "SFX",
        variable: null,
        leftArrowVariable: null,
        rightArrowVariable: null,
        valueVariable1: null,
        valueVariable2: null,
        valueVariable3: null,
        value: 0,
        minVal: false,
        maxVal: false,
        y: 144
      },
      unknown: {
        title: "???",
        variable: null,
        leftArrowVariable: null,
        rightArrowVariable: null,
        valueVariable1: null,
        valueVariable2: null,
        valueVariable3: null,
        value: 0,
        minVal: false,
        maxVal: false,
        y: 164
      }
    };

    // Array containing keys of each record in this.optionsOptions to make access easier
    this.navArray = [ 'music', 'sfx', 'unknown' ];
    this.navNum = this.navArray.length;
    this.canChangeValueRight = true;
    this.canChangeValueLeft = true;
  }

  init( data ) { // Passes the name of the scene from which this scene was called
    this.from = data.from;
  }

  create() {
    // Selection starts on the first option
    this.currentSelection = 1;

    this.addKeys();
    this.createBackground();
    this.createTitle();
    this.loadOptionsValues();
    this.createNavigationElements();

    // Creates keyboard tips if this scene was started from the game menu
    if ( this.from == 'gameMenu' ) {
      this.createKeyboardTips();
    }
  }

  update() {
    this.updateMinMax();
    this.checkKeyboardInput();
    this.updateNavigationOptions();
    this.updateArrowColour();
    this.optionsExit();
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   *  Adds keys that will be used in the scene to change values and navigate.
   */
  addKeys() {
    this.keys = this.input.keyboard.addKeys( {
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      fireUp: Phaser.Input.Keyboard.KeyCodes.UP,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC
    } );
  }

  /**
   * Creates background with animated stars.
   */
  createBackground() {
    this.add.image( 0, 0, 'menu_background' ).setOrigin( 0 );
    this.add.sprite( 0, 0, 'menu_background_stars_frames' ).setOrigin( 0 ).anims.play( 'menu_background_stars' );
  }

  /**
   * Creates 'OPTIONS' title.
   */
  createTitle() {
    this.add.image( this.cameras.main.centerX, 60, 'options_title_text' ).setOrigin( 0.5 );
  }

  /**
   * Loops through the optionsOptions record and adds all elements into the scene.
   */
  createNavigationElements() {
    for ( let i = 0; i < this.navNum; i++ ) {
      const arrayName = this.navArray[ i ];
      const textureName = arrayName + '_text';
      const x = this.cameras.main.centerX - 42 + 60; // x-value of main nav text + 60px
      const y = this.optionsOptions[ arrayName ].y;

      this.optionsOptions[ arrayName ].variable = this.addOptionText( textureName, y );
      this.optionsOptions[ arrayName ].valueVariable1 = this.addOptionDigit( x, y );
      this.optionsOptions[ arrayName ].valueVariable2 = this.addOptionDigit( x + 10, y );
      this.optionsOptions[ arrayName ].valueVariable3 = this.addOptionDigit( x + 20, y );
      this.optionsOptions[ arrayName ].leftArrowVariable = this.addLeftArrow( y );
      this.optionsOptions[ arrayName ].rightArrowVariable = this.addRightArrow( y );

      this.valueToDigits( i ); // Sets option value to saved option value
    }
  }

  /**
   * Gets the option values from the loaded JSON data from the game menu scene and assigns them to variables in the main record.
   */
  loadOptionsValues() {
    var music = this.scene.get( 'gameMenu' ).jsonDetails.options.music;
    var sfx = this.scene.get( 'gameMenu' ).jsonDetails.options.sfx;
    var unknown = this.scene.get( 'gameMenu' ).jsonDetails.options.unknown;

    this.optionsOptions.music.value = music;
    this.optionsOptions.sfx.value = sfx;
    this.optionsOptions.unknown.value = unknown;
  }

  /**
   * Saves the current option values to the JSON data in the game menu and writes the new details to the JSON file.
   * 
   */
  saveOptionsValues() {
    this.scene.get( 'gameMenu' ).jsonDetails.options.music = this.optionsOptions.music.value;
    this.scene.get( 'gameMenu' ).jsonDetails.options.sfx = this.optionsOptions.sfx.value;
    this.scene.get( 'gameMenu' ).jsonDetails.options.unknown = this.optionsOptions.unknown.value;

    fs.writeFile( 'info.json', JSON.stringify( this.scene.get( 'gameMenu' ).jsonDetails, null, 2 ), function ( err ) {
      if ( err ) throw err;
    } );
  }

  /**
   * Adds and returns main nav text.
   */
  addOptionText( frames, y ) {
    var optionText = this.add.sprite( this.cameras.main.centerX - 42, y, frames ).setOrigin( 0.5 ).setTintFill( 0xffffff );
    return optionText;
  }

  /**
   * Adds and returns a number sprite.
   */
  addOptionDigit( x, y ) {
    var sprite = this.add.sprite( x, y, 'number_frames', 0 ).setOrigin( 0, 0.5 );
    return sprite;
  }

  /**
   * Adds and returns left arrow.
   */
  addLeftArrow( y ) {
    var leftArrow = this.add.sprite( this.optionsOptions.music.valueVariable1.x - 5, y, 'arrowLeft_text' ).setOrigin( 0.5 ).setTintFill( 0x000000 );
    return leftArrow;
  }

  /**
   * Adds and returns right arrow.
   */
  addRightArrow( y ) {
    var rightArrow = this.add.sprite( this.optionsOptions.music.valueVariable3.x + 20, y, 'arrowRight_text' ).setOrigin( 0.5 ).setTintFill( 0x000000 );
    return rightArrow;
  }

  /**
   * Checks for keyboard input to change the option selection or option value.
   * 
   * If changing the option value, the option is incremented/decremented by 1,
   * and then waiting by a certain delay before changing the value quickly,
   * allowing the player to both change values quickly and also get a specific
   * number.
   */
  checkKeyboardInput() {
    // Allows value to be changed again if the player lifts the key
    if ( this.keys.left.isUp ) {
      this.canChangeValueLeft = true;
    }
    if ( this.keys.right.isUp ) {
      this.canChangeValueRight = true;
    }

    // All the key input checking
    if ( Phaser.Input.Keyboard.JustDown( this.keys.up ) ) {
      // Decrease selection by 1
      if ( this.currentSelection != 1 ) {
        this.scene.get( 'audio' ).playSFX( 'select' );
        this.currentSelection--;
      }
    } else if ( Phaser.Input.Keyboard.JustDown( this.keys.down ) ) {
      // Increase selection by 1
      if ( this.currentSelection != this.navNum ) {
        this.scene.get( 'audio' ).playSFX( 'select' );
        this.currentSelection++;
      }
    }

    /* -------------------------------- Left Key -------------------------------- */
    else if ( this.keys.left.isDown ) {
      // Decreases option value
      if ( this.canChangeValueLeft ) {
        this.changedToBlack = false;
        switch ( this.currentSelection ) {
          case 1:
            this.valueDecrement( 0 );
            break;
          case 2:
            this.valueDecrement( 1 );
            break;
          case 3:
            this.valueDecrement( 2 );
            break;
        }
      }

      // Prevents value from being changed again if the key hasn't been held down for long enough
      this.canChangeValueLeft = false;

      // After holding key down for long enough, the value changes quickly
      if ( this.keys.left.getDuration() > 200 ) {
        this.canChangeValueLeft = true;
      }

    }

    /* -------------------------------- Right Key ------------------------------- */
    else if ( this.keys.right.isDown ) {
      // Increases option value
      if ( this.canChangeValueRight ) {
        this.changedToBlack = false;
        switch ( this.currentSelection ) {
          case 1:
            this.valueIncrement( 0 );
            break;
          case 2:
            this.valueIncrement( 1 );
            break;
          case 3:
            this.valueIncrement( 2 );
            break;
        }
      }

      // Prevents value from being changed again if the key hasn't been held down for long enough
      this.canChangeValueRight = false;

      // After holding key down for long enough, the value changes quickly
      if ( this.keys.right.getDuration() > 200 ) {
        this.canChangeValueRight = true;
      }
    }
  }

  /**
   * Changes minVal and maxVal for each option depending on the value.
   */
  updateMinMax() {
    Phaser.Utils.Array.Each( this.navArray, ( name ) => {
      // Sets minVal and maxVal both to false initially
      this.optionsOptions[ name ].minVal = false;
      this.optionsOptions[ name ].maxVal = false;
      if ( this.optionsOptions[ name ].value == 0 ) { // 0 is min
        this.optionsOptions[ name ].minVal = true;
      } else if ( this.optionsOptions[ name ].value == 100 ) { // 100 is max
        this.optionsOptions[ name ].maxVal = true;
      }
    } );
  }

  /**
   * Decrements value of an option.
   * 
   * Also calls updateVolume() in the audio scene to update the volume immediately.
   */
  valueDecrement( index ) {
    const value = this.optionsOptions[ this.navArray[ index ] ].value;
    if ( value > 0 ) { // Prevents value from being decremented if at 0
      this.optionsOptions[ this.navArray[ index ] ].value--;
      this.valueToDigits( index );
    }

    // Passes the name of the array and the new volume
    if ( this.navArray[ index ] != 'unknown' ) {
      this.scene.get( 'audio' ).updateVolume( this.navArray[ index ] + 'Array', this.optionsOptions[ this.navArray[ index ] ].value );
    }
  }

  /**
   * Increments value of an option.
   * 
   * Also calls updateVolume() in the audio scene to update the volume immediately.
   */
  valueIncrement( index ) {
    const value = this.optionsOptions[ this.navArray[ index ] ].value;
    if ( value < 100 ) { // Prevents value from being incremented if at 100
      this.optionsOptions[ this.navArray[ index ] ].value++;
      this.valueToDigits( index );
    }

    // Passes the name of the array and the new volume
    if ( this.navArray[ index ] != 'unknown' ) {
      this.scene.get( 'audio' ).updateVolume( this.navArray[ index ] + 'Array', this.optionsOptions[ this.navArray[ index ] ].value );
    }
  }

  /**
   * Gets the value of specified option and changes the frames of the 3 numbers of the option to display the value.
   * 
   * Uses modulus operator to get the last digit of the number in each loop.
   * After each loop, the last digit is removed.
   */
  valueToDigits( index ) {
    let value = this.optionsOptions[ this.navArray[ index ] ].value;

    for ( let i = 0; i < 3; i++ ) {
      var stringRef = 'valueVariable' + String( 3 - i );
      if ( value <= 0 ) {
        this.optionsOptions[ this.navArray[ index ] ][ stringRef ].setFrame( 0 );
      }
      var digit = value % 10;
      this.optionsOptions[ this.navArray[ index ] ][ stringRef ].setFrame( digit );
      value = ( value - digit ) / 10;
    }
  }

  /**
   * Changes the colour of menu options when selected/deselected.
   * 
   * Does not change arrow colour, which is controlled by updateArrowColour().
   */
  updateNavigationOptions() {
    // Sets all sprites to black initially
    Phaser.Utils.Array.Each( this.navArray, ( name ) => {
      this.optionsOptions[ name ].variable.setTintFill( 0x000000 );
      this.optionsOptions[ name ].valueVariable1.setTintFill( 0x000000 );
      this.optionsOptions[ name ].valueVariable2.setTintFill( 0x000000 );
      this.optionsOptions[ name ].valueVariable3.setTintFill( 0x000000 );
      this.optionsOptions[ name ].leftArrowVariable.setTintFill( 0x000000 );
      this.optionsOptions[ name ].rightArrowVariable.setTintFill( 0x000000 );
    } );

    // Changes selection to white
    switch ( this.currentSelection ) {
      case 1:
        this.selectionToWhite( 0 );
        break;
      case 2:
        this.selectionToWhite( 1 );
        break;
      case 3:
        this.selectionToWhite( 2 );
        break;
    }
  }

  /**
   * Changes the fill of the title and number variables of specific option to white.
   */
  selectionToWhite( index ) {
    this.optionsOptions[ this.navArray[ index ] ].variable.setTintFill( 0xffffff );
    this.optionsOptions[ this.navArray[ index ] ].valueVariable1.setTintFill( 0xffffff );
    this.optionsOptions[ this.navArray[ index ] ].valueVariable2.setTintFill( 0xffffff );
    this.optionsOptions[ this.navArray[ index ] ].valueVariable3.setTintFill( 0xffffff );
  }

  /**
   * Changes fill of arrow variables depending on if the value is at its min/max or not.
   */
  updateArrowColour() {
    for ( let i = 0; i < this.navNum; i++ ) {
      if ( this.currentSelection == ( i + 1 ) ) { // Adds 1 to i to get equivalent selected option of this.currentSelection
        if ( this.optionsOptions[ this.navArray[ i ] ].minVal == true ) {
          this.optionsOptions[ this.navArray[ i ] ].leftArrowVariable.setTintFill( 0x424242 ); // Grey if at min
        } else {
          this.optionsOptions[ this.navArray[ i ] ].leftArrowVariable.setTintFill( 0xffffff ); // White if value can be decremented
        }

        if ( this.optionsOptions[ this.navArray[ i ] ].maxVal == true ) {
          this.optionsOptions[ this.navArray[ i ] ].rightArrowVariable.setTintFill( 0x424242 ); // Grey if at max
        } else {
          this.optionsOptions[ this.navArray[ i ] ].rightArrowVariable.setTintFill( 0xffffff ); // White if value can be incremented
        }
      }
    }
  }

  /**
   * Adds keyboard tip sprites to screen and make them move up and down.
   */
  createKeyboardTips() {
    const y = 200;
    this.selectContainer = this.add.container( 250, y );
    this.backContainer = this.add.container( 317, y );

    var arrowKeysSprite = this.add.sprite( 17, 0, 'arrowKeys_key' ).setOrigin( 1, 0.5 );
    var selectSprite = this.add.sprite( 20, 0, 'select_text' ).setOrigin( 0, 0.5 );
    this.selectContainer.add( [ arrowKeysSprite, selectSprite ] );

    var escSprite = this.add.sprite( 0, 0, 'esc_key' ).setOrigin( 0, 0.5 );
    var backSprite = this.add.sprite( 22, 0, 'back_text' ).setOrigin( 0, 0.5 );
    this.backContainer.add( [ escSprite, backSprite ] );

    this.tweens.add( {
      targets: [ this.selectContainer, this.backContainer ],
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
   * Exits when 'escape' is pressed.
   * 
   * If this scene was opened from the pause screen, return
   * to the pause menu.
   * If this scene was opened from the game menu, return to 
   * the game menu.
   */
  optionsExit() {
    if ( Phaser.Input.Keyboard.JustDown( this.keys.esc ) ) {
      this.scene.stop();
      this.scene.get( 'audio' ).playSFX( 'select_confirm' );
      this.scene.get( 'gameMenu' ).getJSONInfo();
      this.saveOptionsValues(); // Saves option values before leaving
      if ( this.from == 'pause' ) {
        this.scene.run( 'pause' );
      } else {
        this.scene.run( 'gameMenu' );
        this.scene.get( 'gameMenu' ).checkIfFart(); // Checks if '???' was changed to 69 and plays the fart track if so
      }
    }
  }
}