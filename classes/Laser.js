class Laser extends Phaser.Physics.Arcade.Sprite {
  /**
   * A small laser shot by the player to damage enemies.
   * 
   * Can be shot in 4 directions. Does a slight amount of knockback to 
   * certain enemies that it comes into contact with. 
   */
  constructor( scene, x, y ) {
    super( scene, x, y, 'laser_frames', 1 );
    this.scene = scene;
    this.scene.physics.world.enable( this );

    // Body
    this.body.setSize( 3, 11 );

    // Variables
    this.laserVelocity = 400;
    this.collided = false;
    this.hitboxDiffY = -16;

    // Hitbox
    this.hitbox = this.scene.physics.add.sprite( this.x, this.y + this.hitboxDiffY, 'laser_frames', 0 );
    this.hitbox.body.setSize( 3, 11 );
    this.hitbox.setDebugBodyColor( 0xffff00 );
    this.hitbox.parent = this;
    this.scene.laserHitboxGroup.add( this.hitbox );

    // Collider
    this.scene.physics.add.collider( this, this.scene.groundLayer, () => {
      this.collide();
      this.scene.scene.get( 'audio' ).randomLaserCollide();
    } );
  }

  preUpdate( time, delta ) {
    super.preUpdate( time, delta );
  }

  update() {
    if ( !this.collided ) {
      // Copies the laser's velocity to the hitbox
      this.hitbox.body.velocity.copy( this.body.velocity );

      this.checkOverlapBlank();
    }
    this.depth = this.y + this.body.offset.y / 2;
    this.hitbox.depth = this.hitbox.y + this.hitbox.height / 2;
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Checks if the tile below the laser is a blank tile.
   * 
   * Calls collide() if it is blank, meaning the laser is out of bounds.
   */
  checkOverlapBlank() {
    var tile = this.scene.groundLayer.getTileAtWorldXY( this.x, this.y );
    try {
      if ( tile.index == tiles.blank ) {
        this.collide();
      }
    } catch ( err ) {
      return;
    }
  }

  /**
   * Fires the laser in a specified direction passed into the function by the player.
   * 
   * Reactivates the laser and resets its body at the passed coordinates, then sets its velocity
   * to a value that sends it flying in the specified direction.
   */
  fire( direction, x, y ) {
    this.setActive( true );
    this.setVisible( true );
    this.body.reset( x, y );
    this.hitbox.body.reset( x, y + this.hitboxDiffY ); // Resets the hitbox at a different position to the shadow
    this.scene.physics.world.enable( [ this, this.hitbox ] );
    this.direction = direction;

    // Changes body and texture angle according to passed direction
    switch ( direction ) {
      case 'up':
        this.body.setVelocityY( -this.laserVelocity );
        break;
      case 'left':
        this.body.setSize( 11, 3 );
        this.hitbox.body.setSize( 11, 3 );
        this.angle = 90;
        this.hitbox.angle = 90;
        this.body.setVelocityX( -this.laserVelocity );
        break;
      case 'down':
        this.hitbox.body.reset( this.x, this.y - 2 ); // Hitbox is reset slightly above the shadow when shot downward
        this.body.setVelocityY( this.laserVelocity );
        break;
      case 'right':
        this.body.setSize( 11, 3 );
        this.hitbox.body.setSize( 11, 3 );
        this.angle = 90;
        this.hitbox.angle = 90;
        this.body.setVelocityX( this.laserVelocity );
        break;
    }

    this.collided = false;
  }

  /**
   * Destroys the laser.
   * 
   * Called when the laser comes into contact with something that destroys it.
   * Plays an animation after changing the angle of the hitbox to make the animation
   * play in the correct orientation.
   */
  collide() {
    this.collided = true;
    this.scene.physics.world.disable( [ this, this.hitbox ] );
    this.setVisible( false ); // Sets the shadow to invisible while the hitbox plays the particle animation
    this.angle = 0;

    // Rotates the laser texture so the particles fly out in the right direction
    switch ( this.direction ) {
      case 'left':
        this.hitbox.angle = -90;
        break;
      case 'down':
        this.hitbox.angle = 180;
        break;
      case 'right':
        this.hitbox.angle = 90;
        break;
    }

    // Randomly chooses 1 of 2 animations
    const num = Phaser.Math.Between( 1, 2 );
    this.hitbox.anims.play( 'laser_explode_' + num );

    // Resets the laser after the animation finishes
    this.hitbox.once( 'animationcomplete', () => {
      this.setActive( false );
      this.body.reset( 0, 0 );
      this.hitbox.x = this.x;
      this.hitbox.y = this.y + this.hitboxDiffY;
      this.angle = 0;
      this.hitbox.angle = 0;
      this.body.setSize( 3, 11 );
      this.hitbox.body.setSize( 3, 11 );
      this.hitbox.setFrame( 0 );
    } );
  }
}