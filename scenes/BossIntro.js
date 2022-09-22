class BossIntro extends Phaser.Scene {
  /**
   * A temporary scene introducing the boss before a boss fight.
   * 
   * Called when the player enters the boss room. Automatically shuts itself
   * down after a delay, but the player can skip by pressing 'space' or 'enter'.
   */
  constructor() {
    super( "bossIntro" );

    this.introLength = 3000;
  }

  create() {
    this.createKeys();
    this.createBackground();
    this.createBossTween();
    this.createDelayedEnd();
    this.createSkip();
  }

  /**
   * Creates keys that will be used to skip the scene.
   */
  createKeys() {
    this.keyEnter = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ENTER );
    this.keySpace = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.SPACE );
  }

  /**
   * Creates the background of the boss intro.
   * 
   * Consists of the background and text.
   */
  createBackground() {
    this.background = this.add.image( 0, 0, "bossIntro" ).setOrigin( 0, 0 );
    this.text = this.add.image( 0, 0, "bossIntro_crazyBirdLady_text" ).setOrigin( 0, 0 );
  }

  /**
   * Creates a tween that makes the boss move at a decreasing speed from offscreen to the right hand side of the screen.
   */
  createBossTween() {
    this.boss = this.add.sprite( this.cameras.main.width, 0, "bossIntro_crazyBirdLady" ).setOrigin( 0, 0 );

    this.tweens.add( {
      targets: this.boss,
      x: this.cameras.main.centerX - 25,
      duration: this.introLength,
      ease: 'Power3'
    } );
  }

  /**
   * Creates a timer that ends the intro and resumes the game after a delay.
   */
  createDelayedEnd() {
    this.delayedTimer = this.time.delayedCall( this.introLength, () => this.endIntro() );
  }

  /**
   * Allows the player to skip the boss intro if they press 'space' or 'enter'.
   */
  createSkip() {
    this.keyEnter.once( 'down', () => {
      this.delayedTimer.remove();
      this.endIntro();
    } );

    this.keySpace.once( 'down', () => {
      this.delayedTimer.remove();
      this.endIntro();
    } );
  }

  /**
   * Resumes game and starts the boss fight.
   * 
   * Called by the key input listener or after a set delay by this.delayedTimer.
   */
  endIntro() {
    this.scene.stop();
    this.scene.resume( 'overlay' );
    this.scene.resume( 'game' );
    this.scene.get( 'game' ).scoreDecreaseTimer.paused = false;
    this.scene.get( 'game' ).totalTimeTimer.paused = false;
    this.scene.get( 'game' ).startBossFight();
  }
}