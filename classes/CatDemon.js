class CatDemon extends Phaser.GameObjects.Sprite {
  /**
   * A fast, close ranged cat demon enemy.
   * 
   * Wanders around map randomly and chases player once within range.
   * Does contact damage.
   * If attacked by player, chases player until it dies regardless of range.
   */
  constructor( scene, x, y ) {
    super( scene, x, y, 'catDemonIdle-Sheet' );
    this.scene = scene;
    this.scene.physics.world.enable( this );
    this.scene.add.existing( this );

    // Body
    this.body.setSize( 55, 8 );
    this.body.offset.x = 3;
    this.body.offset.y = 50;

    // Hitbox
    this.hitbox = this.scene.physics.add.image( this.x + 2, this.y );
    this.hitbox.body.setSize( 50, 24 );
    this.hitbox.setDebugBodyColor( 0xffff00 );
    this.hitbox.body.immovable = true;
    this.hitbox.parent = this;
    this.scene.enemyHitboxGroup.add( this.hitbox );

    // Variables
    this.moveTarget = new Phaser.Math.Vector2();
    this.chasing = false;
    this.randMoving = false;
    this.health = 50 + ( this.scene.level - 1 ) * 10;
    this.flash = false;
    this.alive = true;
    this.beenHurt = false;
    this.randMoveSpeed = 20;
    this.chaseSpeed = 80;
    this.rayCollisionRange = 100;
    this.canSeePlayer = false;
    this.takenKB = 7;
    this.playedSound = false;

    // Ray
    this.ray = this.scene.raycaster.createRay( {
      origin: {
        x: this.x - 5,
        y: this.y + 26
      }
    } );
    this.ray.autoSlice = true;
    this.ray.enableArcadePhysics();
    this.ray.setCollisionRange( this.rayCollisionRange );
    this.ray.castCircle();
    this.rayOverlapper = this.scene.physics.add.overlap( this.ray, [ this.scene.player, this.scene.player.hitbox ], () => {
      this.canSeePlayer = true;
    }, this.ray.processOverlap.bind( this.ray ) ); // Sets this.canSeePlayer to true if its circle ray intersects with the player

    // Colliders
    this.scene.physics.add.collider( this, this.scene.groundLayer, () => this.collideWall ); // Calls collideWall() if the cat collides with the wall
    this.scene.physics.add.overlap( this.hitbox, this.scene.player.hitbox, ( cat, player ) => player.player.hurt( 'normal' ) ); // Damages the player normally upon contact with the cat

    // Flash tween that gives a damaged effect
    this.flashTween = this.scene.tweens.add( {
      targets: this,
      irrelevant: 69,
      paused: true,
      ease: 'Cubic',
      duration: 50,
      repeat: 2,
      onRepeat: () => {
        this.flash = !this.flash;
        if ( this.flash ) {
          this.setTintFill( 0xffffff );
        } else {
          this.clearTint();
        }
      }
    } );
  }

  preUpdate( time, delta ) {
    if ( !this.active ) {
      return; // Prevents update loop from running if cat is dead
    }

    super.preUpdate( time, delta );
  }

  update() {
    if ( this.alive ) {
      // Updates position of hitbox with the cat's body
      this.hitbox.x = this.x;
      this.hitbox.y = this.y;
      this.hitbox.body.velocity.copy( this.body.velocity );

      this.chasePlayer();
      this.flip();
      this.stopMovement();
    }
    this.depth = this.y + this.height / 2;
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Creates a timer that makes the cat move around randomly and a timer that makes it cast its ray regularly.
   */
  spawned() {
    this.movementTimer = this.scene.time.addEvent( {
      delay: 1000,
      callback: () => this.timerRandomiser() // Makes the cat move and also resets this.movementTimer
    } );

    this.rayTimer = this.scene.time.addEvent( {
      delay: Phaser.Math.Between( 500, 600 ),
      callback: () => {
        if ( this.alive && this.scene.player.alive ) {
          this.ray.castCircle();
        }
      },
      loop: true
    } );
  }

  /**
   * Calls randomMove() and resets this.movementTimer to create a loop where the timer calls this function again.
   */
  timerRandomiser() {
    this.randomMove();
    this.movementTimer.reset( {
      delay: Phaser.Math.Between( 500, 5000 ),
      callback: () => this.timerRandomiser(),
      repeat: 1
    } );
  }

  /**
   * Makes the cat chase the player when it can see the player, or when its been hurt already.
   */
  chasePlayer() {
    if ( ( this.beenHurt || this.canSeePlayer ) && this.scene.player.alive ) {
      this.chasing = true;
      this.randMoving = false;
      this.scene.physics.moveToObject( this, this.scene.player, this.chaseSpeed );
      this.anims.play( 'catDemon_run', true );

      if (!this.playedSound) {
        this.scene.scene.get( 'audio' ).playSFX( 'catDemon_chase' );
        this.playedSound = true;
      }
    } else {
      this.chasing = false;
    }
  }

  /**
   * Flips the cat's sprite, shifts its hitbox position, and changes ray origin depending on its velocity.
   */
  flip() {
    if ( this.body.velocity.x > 0 ) {
      this.setFlipX( true );
      this.hitbox.x = this.x - 2;
      this.ray.setOrigin( this.x + 5, this.y + 26 );
    } else if ( this.body.velocity.x < 0 ) {
      this.setFlipX( false );
      this.hitbox.x = this.x + 2;
      this.ray.setOrigin( this.x - 5, this.y + 26 );
    }
  }

  /**
   * Makes the cat move toward a randomly generated coordinate within a certain range, at a random magnitude.
   * 
   * Called by timerRandomiser(), which is in turn called regularly by a timer. Only runs when the cat is not chasing the player.
   * A vector is created at the randomly generated coordinate and the cat moves towards it.
   */
  randomMove() {
    if ( !this.chasing && this.alive ) {
      this.anims.play( 'catDemon_walk', true );
      this.randMoving = true;

      const randAngle = Phaser.Math.DegToRad( Phaser.Math.Between( 1, 360 ) );
      const randMagnitude = Phaser.Math.Between( 10, 30 );

      this.moveTarget.x = this.x + ( randMagnitude * Math.cos( randAngle ) );
      this.moveTarget.y = this.y + ( randMagnitude * Math.sin( randAngle ) );
      this.scene.physics.moveToObject( this, this.moveTarget, this.randMoveSpeed );
    }
  }

  /**
   * Stops cat's movement if the cat is neither chasing nor moving randomly or if the
   * cat is not chasing and it has reached its target from randomMove().
   */
  stopMovement() {
    // Stops movement and animation if cat demon is 1. Not chasing and not moving randomly, 2. The distance between the cat demon and the target coordinate is < 1
    if ( ( !this.chasing && !this.randMoving ) || ( !this.chasing && Phaser.Math.Distance.Between( this.x, this.y, this.moveTarget.x, this.moveTarget.y ) < 1 ) ) {
      this.body.setVelocity( 0 );
      this.anims.play( 'catDemon_idle', true );
    }
  }

  /**
   * Stops cat's movement when it collides with the wall, unless it's chasing the player.
   */
  collideWall() {
    if ( !this.chasing ) {
      this.body.reset( this.x, this.y );
      this.anims.play( 'catDemon_idle', true );
    }
  }

  /**
   * Damages cat and knocks it back.
   * 
   * Passed damage is subtracted from cat's health. If a direction is also passed
   * the cat is knocked back slightly in that direction. If it's new health is below 0, 
   * calls dead().
   */
  hurt( damage, direction ) {
    if ( !this.beenHurt ) {
      this.canPlayChaseSound = true;
    }

    this.beenHurt = true;
    this.health -= damage;

    if ( direction != null ) {
      switch ( direction ) {
        case 'up':
          this.y -= this.takenKB;
          break;
        case 'right':
          this.x += this.takenKB;
          break;
        case 'down':
          this.y += this.takenKB;
          break;
        case 'left':
          this.x -= this.takenKB;
          break;
      }
    }
    this.flashTween.play();

    if ( this.health <= 0 && this.alive ) {
      this.dead();
    }
  }

  /**
   * Kills the cat demon.
   * 
   * Removes things associated with the cat then destroys the sprite.
   */
  dead() {
    this.alive = false;
    this.ray.body.destroy();
    this.movementTimer.remove();
    this.rayOverlapper.destroy();
    this.scene.scoreEmitter.emit( 'addScore', 50 ); // Adds to player's score
    this.scene.physics.world.disable( this );
    this.scene.playerEnemyRaycaster.removeMappedObjects( this.hitbox );
    this.hitbox.destroy();
    this.anims.play( 'catDemon_die' );
    this.scene.scene.get( 'audio' ).sfx_catDemon_chase.stop();
    this.scene.scene.get( 'audio' ).playSFX( 'catDemon_die' );
    this.scene.time.delayedCall( 500, () => this.determinePickupDrop() );
    this.once( 'animationcomplete', () => this.destroy() );
  }

  /**
   * Destroys the cat without a death animation or dropping a pickup.
   */
  kill() {
    this.movementTimer.remove();
    this.rayOverlapper.destroy();
    this.rayTimer.remove();
    this.ray.body.destroy();
    this.scene.playerEnemyRaycaster.removeMappedObjects( this.hitbox );
    this.hitbox.destroy();
    this.destroy();
  }

  /**
   * Decides if the cat will drop a pickup.
   * 
   * Called on the cat's death. Uses randomised numbers and a set array of 
   * drop rates to determine if something will drop.
   */
  determinePickupDrop() {
    const dropRates = [ 10, 50, 50 ]; // % drop rate: [Chance to drop anything, seed, feather]
    var randNum = Phaser.Math.Between( 1, 100 );
    var itemDrop = false;
    var item;

    // Item will drop if the randomly generated number is smaller than the % chance to drop anything
    if ( randNum <= dropRates[ 0 ] ) {
      itemDrop = true;
    }

    // Item is immediately set to feather if itemDrop is true
    // If the newly generated random number is lesser than the drop rate for the seed, the item dropped will be the seed instead
    if ( itemDrop ) {
      item = 'feather';
      randNum = Phaser.Math.Between( 1, 100 );
      if ( randNum <= dropRates[ 1 ] ) {
        item = 'seed';
      }

      // Calls dropPickup() to drop the item
      this.dropPickup( item );
    }

  }

  /**
   * Creates a pickup and calls drop() in its Pickup class.
   * 
   * Called by determinePickupDrop() if a pickup will drop.
   */
  dropPickup( pickup ) {
    var item = this.scene.pickupGroup.getFirstDead( true );
    item.drop( pickup, this.x, this.y, this.y + 26 ); // Passes the pickup type, coordinates where it will spawn, and the ground y-value
  }
}