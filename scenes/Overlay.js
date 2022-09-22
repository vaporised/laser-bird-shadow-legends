class Overlay extends Phaser.Scene {
  /**
   * Overlay of the game.
   * 
   * Displays player health, feather count,
   * and boss bar during boss fight.
   */
  constructor() {
    super( 'overlay' );

    this.heartFlash = false;
  }

  init( scene ) {
    this.gameScene = scene;
  }

  create() {
    this.createMinimap();
    this.createScore();
    this.createHearts();
    this.createFeatherCounter();
    this.createBossBar();
  }

  update() {
    this.updateScore();
    this.updateHearts();
    this.updateFeatherCounter();
    this.updateBossBar();
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Creates score number sprites.
   */
  createScore() {
    const y = 20;
    const startX = -( 3 * 14 + 1 ); // Three 14px wide sprites and 1px gap between third sprite and the container's origin
    this.scoreContainer = this.add.container( this.cameras.main.centerX, y );

    for ( let i = 1; i <= 6; i++ ) {
      var name = 'scoreDigit' + i;
      var x = startX + ( i - 1 ) * 14;
      this[ name ] = this.add.sprite( x, 0, 'number_frames_2' ).setOrigin( 0, 0.5 );
      this.scoreContainer.add( this[ name ] );
    }
  }

  /**
   * Updates score using modulus remainder to get last digit.
   * 
   * Removes the last digit in every loop to get the next digit in the next loop.
   */
  updateScore() {
    var score = this.gameScene.score;

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
   * Adds player hearts to overlay.
   * 
   * Calculates number of hearts that will be visible and adds appropriate number of hearts to overlay.
   */
  createHearts() {
    const numHearts = this.gameScene.player.maxHealth / 2; // 2 health points in one heart
    const firstX = 10;
    const y = 20;

    this.heartContainer = this.add.container( firstX, y );

    for ( let i = 0; i < numHearts; i++ ) {
      var x = firstX + i * 15;
      const name = 'heart' + i;
      this[ name ] = this.add.sprite( x, 0, 'heart_frames' ).setOrigin( 0, 0.5 );
      this.heartContainer.add( this[ name ] );
    }

    // Flash tween that gives a damaged effect to hearts
    this.flashTween = this.tweens.add( {
      targets: this,
      irrelevant: 69,
      paused: true,
      ease: 'Cubic',
      duration: 40,
      repeat: 2,
      onRepeat: () => {
        this.heartFlash = !this.heartFlash;
        if ( this.heartFlash ) {
          for ( let i = 0; i < this.heartContainer.getAll().length; i++ ) {
            const name = 'heart' + i;
            this[ name ].setTintFill( 0xffffff ); // Flashes white
          }
        } else {
          for ( let i = 0; i < this.heartContainer.getAll().length; i++ ) {
            const name = 'heart' + i;
            this[ name ].clearTint();
          }
        }
      }
    } );
  }

  /**
   * Updates the frames of the hearts.
   * 
   * Loops through every heart container while subtracting
   * from health to determine how many containers are filled.
   */
  updateHearts() {
    var health = this.gameScene.player.health;
    const numHearts = this.gameScene.player.maxHealth / 2;

    for ( let i = 0; i < numHearts; i++ ) {
      const name = 'heart' + i;
      if ( health >= 2 ) { // At least one full heart
        health -= 2;
        this[ name ].setFrame( 0 ); // Full
      } else if ( health >= 1 ) { // Half heart
        health -= 1;
        this[ name ].setFrame( 1 ); // Half
      } else { // Empty
        this[ name ].setFrame( 2 ); // Empty
      }
    }
  }

  /**
   * Creates a counter for the number of feathers the player has.
   * 
   * Creates a sprite and two numbers, then adds them to a container.
   */
  createFeatherCounter() {
    const y = 40;
    const x = 20;
    const distanceDigit = 10;

    this.featherContainer = this.add.container( x, y );
    this.featherIcon = this.add.sprite( 0, 0, 'feather_icon' ).setOrigin( 0, 0.5 );
    this.featherDigit1 = this.add.sprite( distanceDigit, 0, 'number_frames_2' ).setScale( 0.5 ).setOrigin( 0, 0.5 );
    this.featherDigit2 = this.add.sprite( distanceDigit + 7, 0, 'number_frames_2' ).setScale( 0.5 ).setOrigin( 0, 0.5 );
    this.featherContainer.add( [ this.featherIcon, this.featherDigit1, this.featherDigit2 ] );
  }

  /**
   * Updates the feather counter with the player's held number of feathers.
   */
  updateFeatherCounter() {
    var featherStr = this.gameScene.player.featherNum.toString();
    if ( featherStr.length == 1 ) { // 1 digit
      this.featherDigit1.setFrame( 0 );
      this.featherDigit2.setFrame( featherStr );
    } else if ( featherStr.length == 2 ) { // 2 digits
      var digit1 = featherStr[ 0 ];
      var digit2 = featherStr[ 1 ];
      this.featherDigit1.setFrame( digit1 );
      this.featherDigit2.setFrame( digit2 );
    }
  }

  /**
   * Creates the elements of the boss bar in a container.
   * 
   * Set to invisible initially.
   */
  createBossBar() {
    this.bossBarContainerContainer = this.add.container( this.cameras.main.centerX, 200 );

    this.bossBarContainer = this.add.sprite( 0, 0, 'bossBarContainer' );
    this.bossBar = this.add.sprite( 0, 0, 'bossBar' );
    this.bossBarText = this.add.sprite( -60, -17, 'boss_text_crazyBirdLady' );
    this.bossBarContainerContainer.add( [ this.bossBarContainer, this.bossBar, this.bossBarText ] );
    this.bossBarContainerContainer.setVisible( false );
  }

  /**
   * Shows boss bar when the boss fight starts.
   */
  updateBossBar() {
    if ( this.gameScene.bossFightInitiated && !this.gameScene.bossDead ) {
      this.bossBarContainerContainer.setVisible( true );

      var percentage = this.gameScene.boss.health / this.gameScene.boss.maxHealth;
      var width = percentage * this.bossBar.width;

      // Crops the boss health texture using its percentage of health left
      this.bossBar.setCrop( 0, 0, width, 10 );
    }

    // Hides bar when boss dies
    if ( this.gameScene.bossDead ) {
      this.bossBarContainerContainer.setVisible( false );
    }
  }

  /**
   * Flashes the hearts.
   * 
   * Called by the player when hurt.
   */
  flashHearts() {
    this.flashTween.play();
  }

  /**
   * Creates a minimap in the top right corner.
   * 
   * Bad quality is intentional. Essentially a zoomed
   * out version of the regular camera.
   */
  createMinimap() {
    this.minimap = this.gameScene.cameras.add( 304, 5, 75, 75 );
    this.minimap.setZoom( 0.08 );
    this.minimap.setName( 'mini' );
    this.minimap.setBackgroundColor( 0x002244 );
    this.minimap.startFollow( this.gameScene.player );
    this.minimap.setBounds( 0, 0, this.gameScene.map.widthInPixels, this.gameScene.map.heightInPixels );
  }

}