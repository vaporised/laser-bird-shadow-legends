class LizardDemon extends Phaser.GameObjects.Sprite {
  /**
   * A slow, ranged lizard demon enemy.
   * 
   * Wanders around idly, and when the player is within range 
   * the lizard moves around to stay a certain distance away 
   * from the player and throws energy balls at the player 
   * to attack.
   */
  constructor( scene, x, y ) {
    super( scene, x, y, 'lizardDemon' );
    this.scene = scene;
    this.scene.physics.world.enable( this );
    this.scene.add.existing( this );

    // Body
    this.body.setSize( 14, 6 );
    this.body.offset.x = 38;
    this.body.offset.y = 69;
    this.body.immovable = true;

    // Hitbox
    this.hitbox = this.scene.physics.add.image( this.x + 2, this.y + 2 );
    this.hitbox.body.setSize( 10, 23 );
    this.hitbox.body.immovable = true;
    this.hitbox.setDebugBodyColor( 0xffff00 );
    this.hitbox.parent = this;
    this.scene.enemyHitboxGroup.add( this.hitbox );

    // Variables
    this.moveTarget = new Phaser.Math.Vector2();
    this.firing = false;
    this.health = 70 + ( this.scene.level - 1 ) * 10;
    this.randMoving = false;
    this.randMoveSpeed = 15;
    this.flash = false;
    this.alive = true;
    this.playerInRange = false;
    this.cooldown = 300;
    this.nextFireTime = 0;
    this.canCheckFrames = false;
    this.chaseSpeed = 20;
    this.canSeePlayer = false;
    this.attentionDistance = 130;
    this.takenKB = 5;

    // Ray
    this.ray = this.scene.raycaster.createRay( {
      origin: {
        x: this.x - 1,
        y: this.y + 30
      }
    } );
    this.ray.autoSlice = true;
    this.ray.enableArcadePhysics();
    this.ray.castCircle();
    this.rayOverlapper = this.scene.physics.add.overlap( this.ray, [ this.scene.player, this.scene.player.hitbox ], () => this.canSeePlayer = true, this.ray.processOverlap.bind( this.ray ) );

    // Collider
    this.scene.physics.add.collider( this, this.scene.groundLayer );

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
    super.preUpdate( time, delta );
    this.canSeePlayer = false;
  }

  update() {
    if ( this.alive ) {
      // Updates hitbox position and copies its own velocity to the hitbox
      this.hitbox.x = this.x + 2;
      this.hitbox.y = this.y + 2;
      this.hitbox.body.velocity.copy( this.body.velocity );

      this.checkViewDistance();
      this.checkFireFrame();
      this.checkPlayerDistance();
      this.stopMovement();
      this.flip();
    }
    this.depth = this.y + this.height / 2;
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Creates a timer that is reset repeatedly to make the lizard move randomly and a timer to cast rays regularly.
   * 
   * movementTimer calls timerRandomiser(), which makes the lizard move randomly and also resets movementTimer to 
   * start the timer again. rayTimer has a random delay that casts rays regularly to check if the player is in a certain
   * radius around the lizard.
   */
  spawned() {
    this.movementTimer = this.scene.time.addEvent( {
      delay: 1000,
      callback: () => this.timerRandomiser()
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
   * Calls randomMove() to make the lizard move randomly and resets the movementTimer to create a loop.
   */
  timerRandomiser() {
    this.randomMove();
    this.movementTimer.reset( {
      delay: Phaser.Math.Between( 1000, 3000 ),
      callback: () => this.timerRandomiser(),
      repeat: 1
    } );
  }

  /**
   * Plays firing animation if conditions are met.
   * 
   * Checks if the lizard's firing cooldown is over, the player is in range and the lizard is not already firing.
   */
  checkViewDistance() {
    if ( this.playerInRange && this.scene.time.now > this.nextFireTime && !this.firing ) {
      this.playFireAnimation();
    }
  }

  /**
   * Makes the lizard move randomly.
   * 
   * Creates a vector at a random location within a certain range around
   * the lizard, and makes the lizard move towards it. Only run if the
   * lizard is not firing and the player is not in the firing range.
   */
  randomMove() {
    if ( !this.firing && this.alive && !this.playerInRange ) {
      this.randMoving = true;
      this.anims.play( 'lizardDemon_idle' );

      const randAngle = Phaser.Math.DegToRad( Phaser.Math.Between( 1, 360 ) );
      const randMagnitude = Phaser.Math.Between( 10, 30 );

      this.moveTarget.x = this.x + ( randMagnitude * Math.cos( randAngle ) );
      this.moveTarget.y = this.y + ( randMagnitude * Math.sin( randAngle ) );

      this.scene.physics.moveToObject( this, this.moveTarget, this.randMoveSpeed );
    }
  }

  /**
   * Flips the lizard's sprite depending on certain conditions.
   * 
   * If the player is not in the lizard's range, the lizard flips depending on its x-velocity.
   * If the player is in range, the lizard will always flip to face the player.
   * Changes ray origin and body offsets slightly when flipped.
   */
  flip() {
    if ( ( this.body.velocity.x > 0 && !this.playerInRange ) || ( this.playerInRange && this.scene.player.x > this.x ) ) {
      this.setFlipX( true );
      this.hitbox.body.offset.x = 11;
      this.body.offset.x = 43;
      this.ray.setOrigin( this.x + 1, this.y + 30 );
    } else if ( ( this.body.velocity.x < 0 && !this.playerInRange ) || ( this.playerInRange && this.scene.player.x < this.x ) ) {
      this.setFlipX( false );
      this.hitbox.body.offset.x = 6;
      this.body.offset.x = 38;
      this.ray.setOrigin( this.x - 1, this.y + 30 );
    }
  }

  /**
   * Checks if the frame in the attacking animation is the frame where the lizard releases the ball.
   * 
   * Only runs when canCheckFrames is true.
   */
  checkFireFrame() {
    const targetIndex = 16; // Frame index where the lizard releases the ball
    if ( this.canCheckFrames && this.anims.currentFrame.index == targetIndex ) {
      this.fireEnergyBall();
      this.canCheckFrames = false; // Sets canCheckFrames to false to prevent function from running again
    }
  }

  /**
   * Plays the firing animation of the energy ball.
   * 
   * On completion of animation, plays the idle animation starting at frame index 4 for a smooth transition.
   */
  playFireAnimation() {
    // Plays the firing animation
    this.firing = true;
    this.randMoving = false;
    this.canCheckFrames = true; // Allows checkFireFrame() in update() to check for when the lizard releases the ball
    this.anims.play( 'lizardDemon_attack' );
    this.scene.scene.get( 'audio' ).playSFX( 'lizardDemon_attack' );

    // Plays idle animation once firing animation finishes
    this.once( 'animationcomplete', () => {
      this.anims.play( 'lizardDemon_idle', true, 4 );
      this.firing = false;
      this.nextFireTime = this.scene.time.now + this.cooldown; // Next time the lizard can fire
    } );
  }

  /**
   * Creates a new energy ball and fires it.
   * 
   * Called by checkFireFrame() when the lizard's firing animation reaches a specific frame.
   * Changes spawn coordinate depending on which way the lizard is flipped.
   */
  fireEnergyBall() {
    var direction;
    const y = this.y + 9;
    var x = this.x;

    if ( this.flipX ) {
      direction = 'right';
      x += 4;
    } else {
      direction = 'left';
      x -= 4;
    }

    var energyBall = this.scene.energyBallGroup.getFirstDead( true );
    energyBall.fire( x, y, direction );

    this.scene.scene.get( 'audio' ).playSFX( 'lizardDemon_fire' );
  }

  /**
   * Calculates the distance between the lizard and the player, and moves accordingly.
   * 
   * Lizard must be able to see player to do anything.
   * If very close to player, lizard moves backwards away from the player by
   * creating a vector behind itself and moves towards it.
   * If in a certain range away from the player, stays still.
   * If far away from the player but it can still see the player,
   * moves towards the player.
   */
  checkPlayerDistance() {
    var player = this.scene.player;
    const distance = Phaser.Math.Distance.Between( this.x, this.y, player.x, player.y );

    if ( distance < this.attentionDistance - 30 && this.canSeePlayer ) { // Move away
      this.playerInRange = true;
      this.body.reset( this.x, this.y );
      this.moveAwayFromPlayer();
    } else if ( distance < this.attentionDistance - 20 && this.canSeePlayer ) { // Stay still
      this.playerInRange = true;
      this.body.reset( this.x, this.y );

    } else if ( distance < this.attentionDistance && this.canSeePlayer ) { // Move closer
      this.playerInRange = true;
      this.body.reset( this.x, this.y );

      this.scene.physics.moveToObject( this, player, this.chaseSpeed );
    } else {
      this.playerInRange = false;

    }
  }

  /**
   * Creates and manipulates vectors to make the lizard move away from the player.
   */
  moveAwayFromPlayer() {
    var player = this.scene.player;

    // Vectors to move the lizard away from the player
    var lizardVector = new Phaser.Math.Vector2( this.x, this.y ); // Lizard's position vector
    var playerVector = new Phaser.Math.Vector2( player.x, player.y ); // Player's position vector
    var reversedLizardPlayerVector = playerVector.subtract( lizardVector ).negate(); // Displacement vector from player to lizard
    var outwardVector = lizardVector.add( reversedLizardPlayerVector ); // Displacement vector from lizard to a new set of coordinates 

    // Moves lizards towards new coordinates
    this.scene.physics.moveToObject( this, outwardVector, this.chaseSpeed );
  }

  /**
   * Stops movement of lizard if conditions are fulfilled.
   * 
   * Stops movement if the lizard cannot see the player and is not moving randomly.
   * Stops movement if the lizard cannot see the player and it has reached the vector created in checkPlayerDistance()
   */
  stopMovement() {
    // Stops movement if not doing anything or within the move target when chasing the player
    if ( ( !this.playerInRange && !this.randMoving ) || ( !this.playerInRange && Phaser.Math.Distance.Between( this.x, this.y, this.moveTarget.x, this.moveTarget.y ) < 1 ) ) {
      this.body.reset( this.x, this.y );
      if ( !this.firing ) {
        this.anims.play( 'lizardDemon_idle', true ); // Only plays idle animation if not firing
      }
    }
  }

  /**
   * Damages lizard.
   * 
   * Subtracts passed damage value from health and knocks lizard back
   * slightly using passed direction. Calls dead() if health is below 0.
   */
  hurt( damage, direction ) {
    this.health -= damage;
    this.flashTween.play();

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

    if ( this.health <= 0 && this.alive ) {
      this.dead();
    }
  }

  /**
   * Kills the lizard.
   * 
   * Destroys things associated with the lizard and plays
   * a short death animation, then destroys the lizard after
   * the animation is completed.
   */
  dead() {
    this.alive = false;
    this.rayOverlapper.destroy();
    this.ray.body.destroy();
    this.rayTimer.remove();
    this.movementTimer.remove();
    this.scene.scoreEmitter.emit( 'addScore', 70 ); // Adds to player's score
    this.scene.playerEnemyRaycaster.removeMappedObjects( this.hitbox );
    this.hitbox.destroy();
    this.scene.physics.world.disable( this );
    this.anims.play( 'lizardDemon_die' );
    this.scene.scene.get( 'audio' ).sfx_lizardDemon_attack.stop();
    this.scene.scene.get( 'audio' ).sfx_lizardDemon_fire.stop();
    this.scene.scene.get( 'audio' ).playSFX( 'lizardDemon_die' );

    this.scene.time.delayedCall( 500, () => this.determinePickupDrop() );
    this.once( 'animationcomplete', () => this.destroy() );
  }

  /**
   * Kills the lizard without playing a death animation.
   */
  kill() {
    this.movementTimer.remove();
    this.rayTimer.remove();
    this.scene.playerEnemyRaycaster.removeMappedObjects( this.hitbox );
    this.hitbox.destroy();
    this.ray.body.destroy();
    this.rayOverlapper.destroy();
    this.destroy();
  }

  /**
   * Decides if the lizard will drop a pickup.
   * 
   * Called on the lizard's death. Uses randomised numbers and a set array of 
   * drop rates to determine if something will drop.
   */
  determinePickupDrop() {
    const dropRates = [ 20, 20, 80 ]; // % drop rate: [Chance to drop anything, seed, feather]
    var randNum = Phaser.Math.Between( 1, 100 );
    var itemDrop = false;
    var item;

    // If a randomly generated number is lesser than the probability of dropping anything, itemDrop is set to true
    if ( randNum <= dropRates[ 0 ] ) {
      itemDrop = true;
    }

    // If itemDrop is true, item is set to feather
    // If a second number generated is lesser than the drop rate for the seed, the item dropped will be the seed instead
    if ( itemDrop ) {
      item = 'feather';
      randNum = Phaser.Math.Between( 1, 100 );
      if ( randNum <= dropRates[ 1 ] ) {
        item = 'seed';
      }
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
    item.drop( pickup, this.x, this.y, this.y + 22 ); // Last parameter is the ground y-value where the pickup will stop falling
  }
}