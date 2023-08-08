class EnergyBall extends Phaser.Physics.Arcade.Sprite {
  /**
   * An energy ball that homes towards the player and deals contact damage.
   * 
   * Created by lizard demons as their attack.
   */
  constructor( scene, x, y ) {
    super( scene, x, y, 'energyBallFloat_frames' );
    this.scene = scene;
    this.scene.physics.world.enable( this );
    this.setOrigin( 0.5 );

    // Body
    this.body.setSize( 8, 8 );
    this.body.immovable = true;

    // Variables
    this.speed = 300;
    this.rotateSpeed = 1000;
    this.tolerance = 2;
    this.collided = false;

    // Wall collider
    this.wallCollider = this.scene.physics.add.image( this.x, this.y + 5 ).setOrigin( 0.5 );
    this.wallCollider.body.setSize( 6, 3 );
    this.wallCollider.body.immovable = true;
    this.wallCollider.setDebugBodyColor( 0xffff00 );
    this.wallCollider.parent = this;

    // Colliders
    this.scene.physics.add.collider( this.wallCollider, this.scene.groundLayer, () => this.collide() );

    this.scene.physics.add.collider( this, this.scene.player.hitbox, ( ball, player ) => { // Passes in the direction the ball hit the player so the player's hurt sprite is flipped the correct way
      var direction;
      if ( this.body.velocity.x > 0 ) {
        direction = 'left';
      } else if ( this.body.velocity.x < 0 ) {
        direction = 'right';
      }
      player.player.hurt( 'normal', direction );
      this.collide();
    } );
  }

  preUpdate( time, delta ) {
    super.preUpdate( time, delta );
  }

  update() {
    if ( !this.collided ) {
      this.homeOnPlayer();
      this.anims.play( 'energyBall_float', true );
    }
    this.depth = this.y + this.height / 2;
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Resets the ball to the given coordinates and launches them at a slight angle that corresponds to the direction passed.
   */
  fire( x, y, direction ) {
    this.scene.physics.world.enable( [ this, this.wallCollider ] );

    // Reset ball and wall collider to given coordinates, with the wall collider slightly lower
    this.body.reset( x, y );
    this.wallCollider.body.reset( x, y + 5 );

    // Set y velocity to make the ball fly downward slightly
    this.setActive( true ).setVisible( true );
    this.body.setVelocityY( 30 );
    this.wallCollider.body.setVelocityY( 30 );

    // Uses passed direction to select the correct x velocity 
    if ( direction == 'right' ) {
      this.body.setVelocityX( 30 );
      this.wallCollider.body.setVelocityX( 30 );
      this.setFlipX( true );
    } else {
      this.body.setVelocityX( -30 );
      this.wallCollider.body.setVelocityX( -30 );
      this.setFlipX( false );
    }

    this.collided = false;
  }

  /**
   * Makes the ball home in on the player.
   * 
   * Calculates the angle between the ball and the player to make it face the player.
   * Manipulates acceleration to make the ball face the player and uses its rotation
   * to manipulate its velocity.
   */
  homeOnPlayer() {
    var angleToPlayer = Phaser.Math.Angle.Between( this.x, this.y, this.scene.player.x, this.scene.player.y );
    var angleChange = Phaser.Math.Angle.Wrap( angleToPlayer - this.rotation );

    if ( Phaser.Math.Within( 0, angleChange, this.tolerance ) ) {
      this.rotation = angleToPlayer;
      this.setAngularAcceleration( 0 );
      this.wallCollider.setAngularAcceleration( 0 );
    } else {
      this.setAngularAcceleration( Math.sign( angleChange ) * Phaser.Math.RadToDeg( this.rotateSpeed ) );
      this.wallCollider.setAngularAcceleration( Math.sign( angleChange ) * Phaser.Math.RadToDeg( this.rotateSpeed ) );
    }

    // Calculates the velocity from the rotation and applies it to the ball's acceleration
    this.scene.physics.velocityFromRotation( this.rotation, this.speed, this.body.acceleration );
    this.scene.physics.velocityFromRotation( this.rotation, this.speed, this.wallCollider.body.acceleration );
  }

  /**
   * Destroys the ball.
   * 
   * Called when the ball hits the wall/player.
   * Plays an explosion animation then sets it to inactive to be reused later.
   */
  collide() {
    this.anims.play( 'energyBall_explode' );
    this.scene.scene.get( 'audio' ).playSFX( 'energyBall_explode' );
    this.scene.physics.world.disable( [ this, this.wallCollider ] );
    this.collided = true;

    this.once( 'animationcomplete', () => {
      this.setActive( false );
      this.setVisible( false );
      this.body.reset( 0, 0 );
      this.wallCollider.body.reset( 0, 0 );
    } );
  }
}