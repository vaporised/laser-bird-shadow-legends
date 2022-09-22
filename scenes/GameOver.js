class GameOver extends Phaser.Scene {
  /**
   * A game over screen that appears when the player dies.
   * 
   * Displays the player's score, time and total kills.
   * The player can either restart the game or return to 
   * the game menu.
   */
  constructor() {
    super( 'gameOver' );
  }

  /**
   * Gets player run info from the game scene.
   */
  init( data ) {
    this.score = data.score;
    this.time = data.time;
    this.kills = data.kills;
    this.newBest = data.newBest;
  }

  create() {
    this.scene.get( 'audio' ).playMusic( 'gameOver' );

    this.stopGame();
    this.checkKeyboardInput();
    this.displayBackground();
    this.displayBird();
    this.displayText();
    this.displayDetails();
    this.displayKeyboardTips();
    this.checkIfNewBest();
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Stops the game while still rendering it behind the game over scene.
   */
  stopGame() {
    this.scene.pause( 'game' );
  }

  /**
   * Displays a black liquid background while darkening the game behind.
   */
  displayBackground() {
    this.add.rectangle( 0, 0, 384, 216, 0x000000, 0.6 ).setOrigin( 0 );
    this.add.image( 0, 0, 'gameOver_background' ).setOrigin( 0 );
  }

  /**
   * Makes 'GAME OVER' text fly down from above the screen, overshoot slightly, then ease back to y = 20.
   */
  displayText() {
    this.text = this.add.sprite( this.cameras.main.centerX, -16, "gameOver_text" ).setOrigin( 0.5, 0 );

    this.tweens.add( {
      targets: this.text,
      y: 20,
      duration: 1000,
      ease: 'Back',
      easeParams: [ 2 ]
    } );
  }

  /**
   * Determines if the player has a new highscore.
   * 
   * If they have a new highscore, displays 'New best!' text
   * near the score.
   */
  checkIfNewBest() {
    if ( this.newBest ) {
      this.new = this.add.sprite( this.cameras.main.centerX, 124, 'new_text' );
      this.new.setOrigin( 0.5 );
      this.new.setTintFill( 0xffffff );
      this.new.setScale( 0.5 );

      this.tweens.add( {
        targets: this.new,
        y: '-=1',
        yoyo: true,
        repeat: -1,
        repeatDelay: 150,
        duration: 100,
        ease: 'Stepped',
        easeParams: [ 1 ]
      } );
    }
  }

  /**
   * Displays a melted bird sprite on the scene.
   */
  displayBird() {
    const y = 50;
    this.bird = this.add.sprite( this.cameras.main.centerX, y, 'gameOver_bird_dead' ).setOrigin( 0.5, 0 );
  }

  /**
   * Displays the player's run details.
   */
  displayDetails() {
    this.displayScore();
    this.displayTime();
    this.displayKills();
  }

  /**
   * Displays the player's score at the centre of the scene.
   */
  displayScore() {
    const y = 106;
    const startX = -( 3 * 12 + 2 ); // Three 12px wide sprites and 2px gap between the third sprite and the container's origin
    var score = this.score;
    this.scoreContainer = this.add.container( this.cameras.main.centerX, y );

    // Adds number sprites
    for ( let i = 1; i <= 6; i++ ) {
      var name = 'scoreDigit' + i;
      var x = startX + ( i - 1 ) * 12;
      this[ name ] = this.add.sprite( x, 0, 'number_frames' ).setOrigin( 0, 0.5 ).setTintFill( 0xffffff );
      this.scoreContainer.add( this[ name ] );
    }

    // Changes frame of number sprites to display the score
    for ( let i = 0; i < 6; i++ ) {
      var stringRef = 'scoreDigit' + String( 6 - i );
      if ( score <= 0 ) {
        this[ stringRef ].setFrame( 0 );
      }
      var digit = score % 10;
      this[ stringRef ].setFrame( digit );
      score = ( score - digit ) / 10;
    }
  }

  /**
   * Displays the player's run time below the score and to the left.
   * 
   * Also displays a clock sprite to the left of the time.
   */
  displayTime() {
    var containerX = this.cameras.main.centerX - 40 - 15 - 32; // The origin of the container is on the left, so the length of the contents of the container are subtracted from the centre, and a 32px space
    const y = 140;
    this.timeContainer = this.add.container( containerX, y );

    this.clock = this.add.sprite( 0, 0, 'gameOver_clock' ).setOrigin( 0, 0.5 );
    this.timeContainer.add( this.clock );
    var time = this.time.split( ':' ).join( '' ); // Converts the time into a string of numbers
    var startX = 15 + 4; // Clock sprite is 15px wide + 4px space between sprite and numbers

    // Displays time
    for ( let i = 1; i <= 6; i++ ) {
      if ( i == 3 ) { // Colon added before third number
        let name = 'colon1';
        this[ name ] = this.add.sprite( startX + 1, 0, 'colon' ).setOrigin( 0, 0.5 ).setScale( 0.5 ).setTintFill( 0xffffff );
        this.timeContainer.add( this[ name ] );
        startX += 1;
      } else if ( i == 5 ) { // Colon added before fifth number
        let name = 'colon2';
        this[ name ] = this.add.sprite( startX + 1, 0, 'colon' ).setOrigin( 0, 0.5 ).setScale( 0.5 ).setTintFill( 0xffffff );
        this.timeContainer.add( this[ name ] );
        startX += 1;
      }

      // Adds number sprites
      let name = 'time' + i;
      this[ name ] = this.add.sprite( startX, 0, 'number_frames' ).setOrigin( 0, 0.5 ).setScale( 0.5 ).setTintFill( 0xffffff ).setFrame( time[ i - 1 ] );
      this.timeContainer.add( this[ name ] );
      startX += 6;
    }
  }

  /**
   * Displays the player's total kills below the score and to the right.
   * 
   * Also displays a skull sprite to the left of the number.
   */
  displayKills() {
    const x = this.cameras.main.centerX + 50;
    const y = 140;
    var kills = this.kills.toString();
    this.killsContainer = this.add.container( x, y );

    this.skull = this.add.sprite( 0, 0, 'gameOver_skull' ).setOrigin( 0, 0.5 );
    this.killsContainer.add( this.skull );

    var startX = 13 + 3; // Skull is 13px wide + 3px space between sprite and numbers

    // Displays kills 
    for ( let i = 0; i < kills.length; i++ ) {
      let name = 'kills' + ( i + 1 );
      let x = startX + 6 * i;
      let frame = kills[ i ];
      this[ name ] = this.add.sprite( x, 0, 'number_frames' ).setOrigin( 0, 0.5 ).setScale( 0.5 ).setTintFill( 0xffffff ).setFrame( frame );
      this.killsContainer.add( this[ name ] );
    }
  }

  /**
   * Displays keyboard tips at the bottom of the scene and make them move up and down.
   */
  displayKeyboardTips() {
    const y = 200;

    // Exit
    var esc = this.add.sprite( -18, 0, 'esc_key' ).setOrigin( 0, 0.5 );
    var exit = this.add.sprite( 4, 0, 'exitText' ).setOrigin( 0, 0.5 ).setTintFill( 0xffffff );
    var exitContainer = this.add.container( this.cameras.main.centerX - 155, y );
    exitContainer.add( [ esc, exit ] );

    // Restart
    var enter = this.add.sprite( -16, 0, 'enter_key' ).setOrigin( 0, 0.5 );
    var restart = this.add.sprite( 4, 0, 'restartText' ).setOrigin( 0, 0.5 ).setTintFill( 0xffffff );
    var restartContainer = this.add.container( this.cameras.main.centerX + 140, y );
    restartContainer.add( [ enter, restart ] );

    // Makes tips move up and down
    this.tweens.add( {
      targets: [ exitContainer, restartContainer ],
      y: '-=1',
      yoyo: true,
      repeat: -1,
      repeatDelay: 150,
      duration: 100,
      ease: 'Stepped',
      easeParams: [ 1 ]
    } );
  }

  /**
   * Adds keys and listeners.
   * 
   * Pressing 'escape' exits to the main menu.
   * Pressing 'enter' restarts the game.
   */
  checkKeyboardInput() {
    this.keyEnter = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ENTER );
    this.keyEscape = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ESC );

    this.keyEscape.once( 'down', () => this.exitToMenu() );
    this.keyEnter.once( 'down', () => this.restartGame() );
  }

  /**
   * Closes game related scenes and starts game menu.
   */
  exitToMenu() {
    this.scene.get( 'audio' ).playSFX( 'select_confirm' );
    this.scene.stop( 'game' );
    this.scene.stop( 'overlay' );
    this.scene.start( 'gameMenu' );
  }

  /**
   * Restarts game at level 1.
   */
  restartGame() {
    this.scene.get( 'audio' ).playSFX( 'select_confirm' );
    this.scene.stop( 'overlay' );
    this.scene.start( 'game', {
      level: 1
    } );
  }
}