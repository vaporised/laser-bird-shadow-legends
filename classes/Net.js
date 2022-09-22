class Net extends Phaser.Physics.Arcade.Sprite {
  /**
   * A net that is summoned by the Crazy Bird Lady boss in its 
   * second phase.
   * 
   * Does strong contact damage.
   * Appears first as a target on the ground where it will drop,
   * then resets itself as a net from the top of the screen, falling
   * until it reaches where the target was located. Stays on the ground
   * for a few seconds where it will deal damage to the player if they
   * come into contact with it, before disappearing.
   */
  constructor( scene, x, y ) {
    super( scene, x, y, 'net_frames' );
    this.scene = scene;
    this.scene.physics.world.enable( this );

    // Body
    this.body.setSize( 26, 10 );
    this.body.offset.x = 3;
    this.body.offset.y = 20;
    this.body.immovable = true;

    // Variables
    this.falling = false;
    this.landed = false;
    this.flash = false;
    this.fallAcceleration = 900;
    this.timeOnGround = 5000;

    // Tween that makes targets flash red
    this.targetTween = this.scene.tweens.add( {
      targets: this,
      irrelevant: 69,
      paused: true,
      ease: 'Cubic',
      duration: 50,
      onRepeat: () => {
        this.flash = !this.flash;
        if ( this.flash ) {
          this.setTintFill( 0xFF0000 );
        } else {
          this.clearTint();
        }
      },
      repeat: -1
    } );

    // Collider 
    this.collider = this.scene.physics.add.overlap( this, this.scene.player.hitbox, ( net, player ) => player.player.hurt( 'strong' ) );
    this.collider.active = false;
  }

  preUpdate( time, delta ) {
    super.preUpdate( time, delta );
  }

  update() {
    this.checkIfFallen();
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Finds a random location in the room and resets itself at the coordinates as a target.
   * 
   * Called by the Crazy Bird Lady boss in the summon attack to begin the attack.
   */
  targetGround() {
    const {
      left,
      right,
      top,
      bottom
    } = this.scene.bossRoom;

    this.targetX = Phaser.Math.Between( this.scene.map.tileToWorldX( left + 1 ), this.scene.map.tileToWorldX( right - 1 ) );
    this.targetY = Phaser.Math.Between( this.scene.map.tileToWorldY( top + 1 ), this.scene.map.tileToWorldY( bottom - 1 ) );

    this.body.reset( this.targetX, this.targetY );
    this.setVisible( true );
    this.setActive( true );
    this.setFrame( 0 ); // Frame where the net appears as a target
    this.targetTween.resume(); // Makes the target flash between red and its regular colour quickly
  }

  /**
   * Makes the net accelerate from the top of the screen onto the ground.
   * 
   * Called by the Crazy Bird Lady boss to make the targets reset themselves
   * as nets at the top of the screen and fall down.
   */
  fall() {
    const height = this.scene.bossRoom.height;

    // y-value where the net will will reset at, above the boss room
    // A randomised value is subtracted from the value to prevent every net from landing at the same time
    const y = this.targetY - this.scene.map.tileToWorldY( height ) - Phaser.Math.Between( 0, 200 ); 

    this.body.reset( this.targetX, y );
    this.setFrame( 1 ); // Falling net frame
    this.setAccelerationY( this.fallAcceleration );
    this.falling = true;
    this.targetTween.pause();
    this.clearTint();
  }

  /**
   * If the net is falling and it has reached its target y coordinate, 
   * calls fallen() to stop it from continuing to fall.
   * 
   * Is in update().
   */
  checkIfFallen() {
    if ( this.falling && this.y >= this.targetY ) {
      this.fallen();
    }
  }

  /**
   * Resets the net's velocity to make it stop where it is.
   * 
   * Called by checkIfFallen() if the net has reached its
   * target y coordinate.
   */
  fallen() {
    this.falling = false;
    this.landed = true;
    this.body.reset( this.x, this.targetY );
    this.setFrame( 2 ); // Open net frame
    this.collider.active = true; // Activates collider to hurt the player on collision
    this.scene.scene.get( 'audio' ).playSFX( 'crazyBirdLady_net_fallen' );

    // Resets net out of the room after a delay
    this.timer = this.scene.time.delayedCall( this.timeOnGround, () => this.reset() );
  }

  /**
   * Resets net out of the room and prepares it for the next summon attack
   */
  reset() {
    this.body.reset( 0, 0 );
    this.falling = false;
    this.landed = false;
    this.setFrame( 0 );
    this.setVisible( false );
    this.setActive( false );
    this.collider.active = false; // Disables collider until the net next falls on the ground
  }
}