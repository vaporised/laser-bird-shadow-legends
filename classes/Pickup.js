class Pickup extends Phaser.Physics.Arcade.Sprite {
  /**
   * A sprite that is dropped onto the ground by 
   * enemies.
   * 
   * Can be picked up by the player to heal them
   * or be collected as a consumable item.
   */
  constructor( scene, x, y ) {
    super( scene, x, y, 'drop_frames' );
    this.scene = scene;
    this.scene.physics.world.enable( this );
    this.scene.add.existing( this );

    // Variable
    this.groundY = 0;
    this.falling = false;
    this.fallAcceleration = 500;
    this.item = null;

    // Collider to let the player pick the pickup up
    this.overlapper = this.scene.physics.add.overlap( this, [ this.scene.player, this.scene.player.hitbox ], () => this.pickup() );
    this.overlapper.active = false;
  }

  preUpdate( time, delta ) {
    super.preUpdate( time, delta );
  }

  update() {
    this.checkIfOnGround();
    this.depth = this.y + this.height / 2;
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Drops itself where the enemy died.
   * 
   * Accelerates down until it reaches the specified end y-value,
   * which is the ground.
   */
  drop( pickup, x, y, endY ) {
    this.setActive( true );
    this.setVisible( true );
    this.body.reset( x, y );
    this.body.setAccelerationY( this.fallAcceleration );
    this.groundY = endY; // y-coordinate of ground
    this.falling = true;

    // Sets texture to respective texture using passed key
    if ( pickup == 'feather' ) {
      this.item = 'feather';
      this.setFrame( 1 );
    } else if ( pickup == 'seed' ) {
      this.item = 'seed';
      this.setFrame( 0 );
    }
  }

  /**
   * Stops pickup from falling if it has reached the ground y-value.
   * 
   * Is in update().
   */
  checkIfOnGround() {
    if ( this.falling && this.y >= this.groundY ) {
      this.overlapper.active = true; // Allows itself to collide and therefore be picked up only after it has fallen to the ground
      this.scene.scene.get( 'audio' ).playSFX( 'pickup_drop' );
      this.falling = false;
      this.body.reset( this.x, this.y );
    }
  }

  /**
   * Calls collectPickup() in the Player class and lets the player pick it up if possible.
   * 
   * Called when the player collides with the pickup. If 
   * collectPickup() returns true, resets itself to be reused
   * later as another pickup.
   */
  pickup() {
    var pickupCollected = this.scene.player.collectPickup( this.item );

    if ( pickupCollected ) {
      this.scene.scoreEmitter.emit( 'addScore', 10 );
      this.setActive( false );
      this.setVisible( false );
      this.body.reset( 0, 0 );
      this.overlapper.active = false;
    }
  }
}