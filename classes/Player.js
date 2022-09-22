class Player extends Phaser.GameObjects.Container {
  /**
   * The player bird!
   * 
   * Moves around in 4 direction using the WASD keys.
   * Fires lasers in same 4 directions using arrow keys to damage enemies.
   * Pressing the 'Q' key uses a feather to destroy all enemy projectiles
   * in the room if it has any available.
   * Accelerates around instead of directly manipulating velocity.
   * Can shoot either small lasers at a fast rate or one super laser constantly.
   * Can shoot a super laser when the spacebar is held down while shooting regular lasers.
   * Dies when health reaches 0.
   * Class is a container with three parts: the head, body and hurt sprite.
   * THurt sprite is initially invisible, and is only set to visible temporarily when the player is hurt.
   */
  constructor( config ) {
    super( config.scene, config.x, config.y, null );
    this.scene = config.scene;
    this.scene.physics.world.enable( this );
    this.scene.add.existing( this );

    // Physics related variables
    this.maxSpeed = 120;
    this.accel = 800;
    this.drag = 0.8;

    // Body and physics
    this.body.setSize( 12, 3 );
    this.body.offset.y = 15;
    this.body.offset.x = -6;
    this.body.useDamping = true;
    this.body.setMaxVelocity( this.maxSpeed );
    this.body.setDrag( this.drag );

    // Hitbox
    this.hitbox = this.scene.physics.add.image( this.x, this.y + 3 );
    this.hitbox.body.setSize( 10, 15 );
    this.hitbox.setDebugBodyColor( 0xffff00 );
    this.hitbox.player = this;

    // Other variables
    this.alive = true;
    this.maxHealth = 8;
    this.health = this.maxHealth;
    this.maxFeatherNum = 99;
    this.featherNum = 1;
    this.damage = 6;
    this.nextFireTime = 0;
    this.fireCooldown = 150;
    this.flash = false;
    this.invincible = false;
    this.canDisplayNormalHead = true;
    this.timerActive = false;
    this.currentRoom = null;
    this.largeLaserCooldown = 50;
    this.largeLaserNextDamageTime = 0;

    // Tile detector ray
    this.tileRay = this.scene.playerTileRaycaster.createRay( {
      origin: {
        x: this.x - 6,
        y: this.y + 15,
      },
    } );
    this.tileRay.autoSlice = true;
    this.tileRay.enableArcadePhysics();

    // Enemy detector ray
    this.enemyRay = this.scene.playerEnemyRaycaster.createRay( {
      origin: {
        x: this.x,
        y: this.y,
      },
    } );
    this.enemyRay.autoSlice = true;
    this.enemyRay.enableArcadePhysics();

    // Creates the head, body and hurt sprites, adding them to this container
    this.bodySprite = this.scene.add.sprite( 0, -14, "birdBody_down" ).setOrigin( 0.5, 0 ).play( "birdBody_down" );
    this.headSprite = this.scene.add.sprite( 0, -14, "birdHead_frames" ).setOrigin( 0.5, 0 );
    this.hurtSprite = this.scene.add.sprite( 0, -14, "birdHurt" ).setOrigin( 0.5, 0 );
    this.hurtSprite.visible = false; // Hurt sprite is invisible until player is damaged
    this.add( [ this.bodySprite, this.headSprite, this.hurtSprite ] );

    // Flash tween that gives a damaged effect to all sprites in container
    this.flashTween = this.scene.tweens.add( {
      targets: this,
      irrelevant: 69,
      paused: true,
      ease: "Cubic",
      duration: 50,
      repeat: -1,
      onRepeat: () => {
        this.flash = !this.flash;
        if ( this.flash ) {
          this.headSprite.setTintFill( 0xffffff );
          this.bodySprite.setTintFill( 0xffffff );
          this.hurtSprite.setTintFill( 0xffffff );
        } else {
          this.headSprite.clearTint();
          this.bodySprite.clearTint();
          this.hurtSprite.clearTint();
        }
      }
    } );

    // Adds all keys that are used to control the player
    this.keys = this.scene.input.keyboard.addKeys( {
      // Movement keys
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,

      // Firing keys
      fireUp: Phaser.Input.Keyboard.KeyCodes.UP,
      fireLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
      fireDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
      fireRight: Phaser.Input.Keyboard.KeyCodes.RIGHT,

      // Other
      feather: Phaser.Input.Keyboard.KeyCodes.Q,
      toggleLaser: Phaser.Input.Keyboard.KeyCodes.SPACE,
    } );
  }

  preUpdate() {
    if ( this.alive ) {
      // Updates position of hitbox 
      this.hitbox.x = this.x;
      this.hitbox.y = this.y + 3;
      this.hitbox.body.velocity.copy( this.body.velocity );

      // Updates positions of large laser when it is being shot
      if ( this.start != null ) {
        this.start.body.velocity.copy( this.body.velocity );
        this.middle.body.velocity.copy( this.body.velocity );
        this.end.body.velocity.copy( this.body.velocity );
      }
    }
  }

  update() {
    if ( this.alive ) {
      this.move();
      this.useFeather();

      // Shoot super laser while space is held down, and regular lasers when not held down
      if ( this.keys.toggleLaser.isDown ) {
        this.checkKeysSuperLaser();
      } else {
        this.destroySuperLaser();
        this.checkKeysLaser();
      }
    }
    this.depth = this.y + 15;
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Creates new player rays.
   * 
   * Called when the player proceeds to the next level.
   */
  resetRays() {
    this.tileRay = this.scene.playerTileRaycaster.createRay( {
      origin: {
        x: this.x - 6,
        y: this.y + 16,
      },
    } );
    this.tileRay.autoSlice = true;
    this.tileRay.enableArcadePhysics();

    this.enemyRay = this.scene.playerEnemyRaycaster.createRay( {
      origin: {
        x: this.x,
        y: this.y,
      },
    } );
    this.enemyRay.autoSlice = true;
    this.enemyRay.enableArcadePhysics();
  }

  /**
   * Moves the player around.
   * 
   * Checks keyboard input and sets the player's acceleration
   * to make it move around.
   * Changes animation and textures according to keyboard input.
   */
  move() {
    const keys = this.keys;
    const acceleration = this.accel;
    var movingHor = true;
    var movingVer = true;

    // Horizontal movement
    if ( keys.left.isDown ) {
      this.body.setAccelerationX( -acceleration );
    } else if ( keys.right.isDown ) {
      this.body.setAccelerationX( acceleration );
    } else {
      this.body.setAccelerationX( 0 );
      movingHor = false;
    }

    // Vertical movement
    if ( keys.up.isDown ) {
      this.body.setAccelerationY( -acceleration );
    } else if ( keys.down.isDown ) {
      this.body.setAccelerationY( acceleration );
    } else {
      this.body.setAccelerationY( 0 );
      movingVer = false;
    }

    // Body animations
    if ( keys.up.isDown ) {
      this.bodySprite.anims.play( "birdBody_up", true );
    } else if ( keys.down.isDown ) {
      this.bodySprite.anims.play( "birdBody_down", true );
    } else if ( keys.left.isDown ) {
      this.bodySprite.anims.play( "birdBody_left", true );
    } else if ( keys.right.isDown ) {
      this.bodySprite.anims.play( "birdBody_right", true );
    }

    // Head animations
    if ( this.canDisplayNormalHead ) { // Only sets head texture to the direction it is moving in when not shooting
      if ( keys.up.isDown ) {
        this.headSprite.setFrame( 2 );
      } else if ( keys.down.isDown ) {
        this.headSprite.setFrame( 0 );
      } else if ( keys.left.isDown ) {
        this.headSprite.setFrame( 1 );
      } else if ( keys.right.isDown ) {
        this.headSprite.setFrame( 3 );
      } else {
        this.headSprite.setFrame( 0 ); // Looks down when not moving
      }
    }

    // Body faces down when not moving
    if ( !movingHor && !movingVer ) {
      this.bodySprite.anims.play( "birdBody_down", true );
    }

    // setMaxVelocity() does not work for diagonal movement, so it must be controlled manually
    if ( this.body.speed > this.maxSpeed ) {
      this.body.velocity.normalize().scale( this.maxSpeed );
      this.hitbox.body.velocity.normalize().scale( this.maxSpeed );
    }
  }

  /**
   * Checks keyboard input to fire super laser.
   * 
   * Only runs when space is held down.
   */
  checkKeysSuperLaser() {
    if ( this.keys.fireRight.isDown ) {
      this.fireSuperLaser( "right" );
    } else if ( this.keys.fireDown.isDown ) {
      this.fireSuperLaser( "down" );
    } else if ( this.keys.fireLeft.isDown ) {
      this.fireSuperLaser( "left" );
    } else if ( this.keys.fireUp.isDown ) {
      this.fireSuperLaser( "up" );
    } else {
      this.destroySuperLaser();
    }
  }

  /**
   * Fires a massive laser in given direction.
   * 
   * Has infinite range and does constant damage with a small delay.
   * Hits either the wall or enemies.
   * Uses two rays to detect intersections, one for tiles and the other for enemies.
   * The tile ray is shot out from the player's shadow.
   * The enemy ray is shot out of the player's head.
   * The distance from the player to the collisions of both rays are calculated,
   * and the ray with the closest intersection is used as the collision of the laser.
   */
  fireSuperLaser( direction ) {
    let hitEnemy = false;
    let tileIntersection;
    let distanceToTile;
    let enemyIntersection;
    let distanceToEnemy;
    let scaleAmount;
    let rayAngle;
    let distanceToObject;

    // Creates sections of laser if they don't already exist
    if ( this.start === undefined || this.start === null ) {
      this.start = this.scene.add.sprite( this.x, this.y, "superLaser_start_frames" );
      this.start.anims.play( "superLaser_start" );
      this.start.setOrigin( 0, 0.5 );
      this.scene.physics.world.enable( this.start );

      // Plays a shooting sound effect if the laser was just shot and a looping sustain effect
      this.scene.scene.get( 'audio' ).playSFX( 'super_laser_shoot' );
      this.scene.scene.get( 'audio' ).playSFX( 'super_laser_sustain' );
    }
    if ( this.middle === undefined || this.middle === null ) {
      this.middle = this.scene.add.sprite( this.x, this.y, "superLaser_middle_frames" );
      this.middle.anims.play( "superLaser_middle" );
      this.middle.setOrigin( 0, 0.5 );
      this.scene.physics.world.enable( this.middle );
    }
    if ( this.end === undefined || this.end === null ) {
      this.end = this.scene.add.sprite( 0, 0, "superLaser_end_frames" );
      this.end.anims.play( "superLaser_end" );
      this.end.setOrigin( 0, 0.5 );
      this.scene.physics.world.enable( this.end );
    }

    // Changes things depending on the direction the laser was fired in
    switch ( direction ) {
      case "up":
        // Sets head texture to an open beak facing direction of shot
        this.headSprite.setFrame( 6 );

        // Sets angle of laser sections and rays to match direction of shot
        this.start.angle = 270;
        this.middle.angle = 270;
        this.end.angle = 270;
        rayAngle = 270;

        // Tweaks coordinates of the start and middle section of the laser
        this.start.x = this.x - 1;
        this.start.y = this.y;
        this.middle.x = this.x - 1;
        this.middle.y = this.y - 16;

        // Makes the laser appear below the player if it fires upward
        this.start.setDepth( this.depth - 1 );
        this.middle.setDepth( this.depth - 1 );
        this.end.setDepth( this.depth - 1 );
        break;
      case "down":
        this.headSprite.setFrame( 4 );
        this.start.angle = 90;
        this.middle.angle = 90;
        this.end.angle = 90;
        rayAngle = 90;
        this.start.x = this.x;
        this.start.y = this.y - 7;
        this.middle.x = this.x;
        this.middle.y = this.y + 16 - 7;

        // Makes the laser appear above almost everything
        this.start.setDepth( 9999 );
        this.middle.setDepth( 9999 );
        this.end.setDepth( 9999 );
        break;
      case "right":
        this.headSprite.setFrame( 7 );
        this.start.angle = 0;
        this.middle.angle = 0;
        this.end.angle = 0;
        rayAngle = 0;
        this.start.x = this.x;
        this.start.y = this.y;
        this.middle.x = this.x + 16;
        this.middle.y = this.y;
        this.start.setDepth( 9999 );
        this.middle.setDepth( 9999 );
        this.end.setDepth( 9999 );
        break;
      case "left":
        this.headSprite.setFrame( 5 );
        this.start.angle = 180;
        this.middle.angle = 180;
        this.end.angle = 180;
        rayAngle = 180;
        this.start.x = this.x;
        this.start.y = this.y;
        this.middle.x = this.x - 16;
        this.middle.y = this.y;
        this.start.setDepth( 9999 );
        this.middle.setDepth( 9999 );
        this.end.setDepth( 9999 );
        break;
    }

    // Sets start and middle section to visible in case they were set to invisible in the last update
    this.start.setVisible( true );
    this.middle.setVisible( true );

    // Finds tile intersection using tile ray
    this.tileRay.setAngleDeg( rayAngle );
    this.tileRay.setOrigin( this.x, this.y + 16 ); // y-value of origin is at the player's shadow, not it's head
    tileIntersection = this.tileRay.cast();
    distanceToTile = Phaser.Math.Distance.Between( this.x, this.y, tileIntersection.x, tileIntersection.y );

    // Find enemy intersection using enemy ray
    this.enemyRay.setAngleDeg( rayAngle );
    this.enemyRay.setOrigin( this.x, this.y ); // y-value of origin is at the player's head, where the laser is being shot out of
    enemyIntersection = this.enemyRay.cast();
    distanceToEnemy = Phaser.Math.Distance.Between( this.x, this.y, enemyIntersection.x, enemyIntersection.y );

    // Damage enemy if laser hits enemy and the intersection with the enemy is closer than the intersection with a tile, meaning the actual laser hit the enemy
    if ( enemyIntersection != false && distanceToEnemy < distanceToTile ) {
      this.scene.enemyHitboxGroup.getChildren().forEach( ( enemy ) => { // Loops through all enemy hitboxes
        if ( enemy.getBounds().contains( enemyIntersection.x, enemyIntersection.y ) && enemy.parent.alive ) { // Checks if the intersection point overlaps with any enemy hitbox
          hitEnemy = true;
          if ( this.scene.time.now > this.largeLaserNextDamageTime ) { // Only damages enemy if cooldown is over
            enemy.parent.hurt( this.damage );
            this.scene.scene.get( 'audio' ).randomHurt();
            this.largeLaserNextDamageTime = this.scene.time.now + this.largeLaserCooldown;
          }
        }
      } );
      if ( !hitEnemy ) { // Damages boss if the intersection wasn't with a regular enemy hitbox, meaning the laser hit the boss
        hitEnemy = true;
        if ( this.scene.time.now > this.largeLaserNextDamageTime ) {
          this.scene.boss.hurt( this.damage );
          this.scene.scene.get( 'audio' ).randomHurt();
          this.largeLaserNextDamageTime = this.scene.time.now + this.largeLaserCooldown;
        }
      }
    }

    // Changes end location depending on what laser hits
    if ( hitEnemy ) {
      this.end.x = enemyIntersection.x;
      this.end.y = enemyIntersection.y;
      distanceToObject = distanceToEnemy;
    } else {
      this.end.x = tileIntersection.x;
      this.end.y = tileIntersection.y - 16; // Subtracts 16 from y-value because the tile ray origin is 16px below the player's origin
      distanceToObject = distanceToTile;
    }

    // Tweaks end location, visibility and scaling using direction
    switch ( direction ) {
      case "up":
        // Determines scale decimal using distance to intersection and small tweaks
        scaleAmount = ( distanceToObject - 16 + 14 ) / 16;

        // Tweaks end section position slightly
        this.end.x -= 1;
        if ( !hitEnemy ) {
          this.end.y += 14;
        }

        // Makes the start and middle section of the laser invisible if the player is too close to the intersection
        if ( this.y <= this.end.y ) {
          this.start.setVisible( false );
          this.middle.setVisible( false );
        }

        break;
      case "right":
        scaleAmount = ( distanceToObject - 16 ) / 16;
        this.end.x -= 13;
        if ( hitEnemy ) {
          scaleAmount = distanceToObject / 16;
          this.end.x += 16;
        }
        if ( this.x >= this.end.x ) {
          this.start.setVisible( false );
          this.middle.setVisible( false );
        }
        break;
      case "down":
        scaleAmount = ( distanceToObject - 16 + 7 ) / 16;
        if ( hitEnemy ) {
          scaleAmount = ( distanceToObject - 16 + 7 + 15 ) / 16;
        }
        if ( this.y >= this.end.y ) {
          this.start.setVisible( false );
          this.middle.setVisible( false );
        }
        break;
      case "left":
        this.end.x += 13;
        scaleAmount = ( distanceToObject - 16 - 3 ) / 16;
        if ( hitEnemy ) {
          scaleAmount = distanceToObject / 16;
          this.end.x -= 16;
        }
        if ( this.x <= this.end.x ) {
          this.start.setVisible( false );
          this.middle.setVisible( false );
        }
        break;
    }
    this.middle.setScale( scaleAmount, 1 );
  }

  /**
   * Destroys super laser if active.
   * 
   * Called when the player isn't holding the firing keys down.
   * Stops any super laser sound effects
   */
  destroySuperLaser() {
    if ( this.start != null ) {
      this.start.destroy();
      this.middle.destroy();
      this.end.destroy();
      this.start = null;
      this.middle = null;
      this.end = null;
      this.scene.scene.get( 'audio' ).sfx_super_laser_shoot.stop();
      this.scene.scene.get( 'audio' ).sfx_super_laser_sustain.stop();
    }
  }

  /**
   * Checks keyboard input to fire lasers.
   * 
   * Passes coordinates and direction of shot to fireLaser() function .
   */
  checkKeysLaser() {
    const keys = this.keys;
    const x = this.x;
    const y = this.y;

    // Sets head texture to closed beak looking in direction of shot if canDisplayNormalHead is true
    if ( this.canDisplayNormalHead ) {
      if ( keys.fireUp.isDown ) {
        this.headSprite.setFrame( 2 );
      } else if ( keys.fireLeft.isDown ) {
        this.headSprite.setFrame( 1 );
      } else if ( keys.fireDown.isDown ) {
        this.headSprite.setFrame( 0 );
      } else if ( keys.fireRight.isDown ) {
        this.headSprite.setFrame( 3 );
      }
    }

    // Calls fireLaser() while passing direction and coordinates if cooldown is over
    // Sets head texture to open beak looking in direction of shot
    if ( this.scene.time.now > this.nextFireTime ) {
      if ( keys.fireUp.isDown ) {
        this.fireLaser( "up", x - 1, y + 16 );
        this.headSprite.setFrame( 6 );
      } else if ( keys.fireLeft.isDown ) {
        this.fireLaser( "left", x, y + 16 );
        this.headSprite.setFrame( 5 );
      } else if ( keys.fireDown.isDown ) {
        this.fireLaser( "down", x - 1, y + 16 );
        this.headSprite.setFrame( 4 );
      } else if ( keys.fireRight.isDown ) {
        this.fireLaser( "right", x, y + 16 );
        this.headSprite.setFrame( 7 );
      }
    }
  }

  /**
   * Fires a laser in given direction and from given coordinates.
   * 
   * Creates a cooldown before player can fire laser again, and
   * also creates a timer that prevents the player's head texture 
   * from being set to a closed beak texture until after delay.
   */
  fireLaser( direction, x, y ) {
    this.scene.scene.get( "audio" ).randomLaserShoot();

    var laser = this.scene.laserGroup.getFirstDead( true );
    laser.fire( direction, x, y );

    this.nextFireTime = this.scene.time.now + this.fireCooldown;
    this.canDisplayNormalHead = false;

    // Prevents regular head from being set as the sprite frame until delay
    if ( !this.timerActive ) {
      this.timerActive = true;
      this.scene.time.delayedCall( 100, () => {
        this.canDisplayNormalHead = true;
        this.timerActive = false;
      } );
    }
  }

  /**
   * Destroys all energy balls in the room.
   * 
   * When the player presses 'Q', the player uses a feather if there are any
   * available. The feather destroys all energy balls currently active in the room,
   * but does not prevent lizard demons from creating one.
   */
  useFeather() {
    if ( Phaser.Input.Keyboard.JustDown( this.keys.feather ) && this.featherNum > 0 ) {
      this.featherNum--;
      this.scene.scene.get( 'audio' ).playSFX( 'feather_use' );

      // Creates a camera shake and yellow flash for 200ms
      this.scene.cameras.main.shake( 200, 0.05 );
      this.scene.cameras.main.flash( 200, 246, 236, 204 );

      // Destroy all energy balls in room by looping through the group and destroying all that are in the same room as the player
      this.scene.energyBallGroup.children.each( ( ball ) => {
        var x = this.scene.groundLayer.worldToTileX( ball.x );
        var y = this.scene.groundLayer.worldToTileY( ball.y );
        var ballRoom = this.scene.dungeon.getRoomAt( x, y );

        if ( ballRoom == this.scene.playerRoom ) {
          ball.collide();
        }
      } );
    }
  }

  /**
   * Collects the pickup passed into the function.
   * 
   * Called by pickups that overlap with the player. Returns true if
   * the player collects the pickup, which prompts the pickup to reset
   * itself.
   */
  collectPickup( pickup ) {
    if ( pickup == "seed" ) {
      if ( this.health < this.maxHealth ) {
        // +1 health if not at max health
        this.health++;
        this.scene.scene.get( 'audio' ).playSFX( 'pickup_seed' );
        return true;
      }
    } else if ( pickup == "feather" ) {
      if ( this.featherNum < this.maxFeatherNum ) {
        // +1 feather if not at max number of feathers
        this.featherNum++;
        this.scene.scene.get( 'audio' ).playSFX( 'pickup_feather' );
        return true;
      }
    }
    // Returns false if player can't collect pickup
    return false;
  }

  /**
   * Damages the player.
   * 
   * Amount of damage taken depends on the type of damage passed into the
   * function. Damage is normally 1, but can be 2. If a direction is
   * passed into the function, the player's hurt sprite is flipped to 
   * match the direction the damage is coming from.
   */
  hurt( type, direction ) {
    if ( !this.invincible ) { // Only damages player if invincibility time is over
      this.scene.scene.get( 'audio' ).playSFX( 'bird_hurt' );
      this.scene.scoreEmitter.emit( 'addScore', -20 );

      if ( type == "normal" ) {
        this.health -= 1;
      } else if ( type == "strong" ) {
        this.health -= 2;
      }

      // Determines if hurt sprite is to be flipped if a direction is passed in
      if ( direction == "right" ) {
        this.hurtSprite.setFlipX( true );
      } else if ( direction == "left" ) {
        this.hurtSprite.setFlipX( false );
      }

      // Sets the regular bird sprites to invisible and set the hurt sprite to visible
      this.headSprite.visible = false;
      this.bodySprite.visible = false;
      this.hurtSprite.visible = true;

      // Exits function early if player is dead
      if ( this.health <= 0 && this.alive ) {
        this.dead();
        return;
      }

      this.invincible = true;
      this.flashTween.resume(); // Plays flashing damaged effect
      this.scene.scene.get( "overlay" ).flashHearts(); // Flashes hearts in overlay

      // First timer displays regular sprites again, second timer ends invincibility time and flash tween
      this.scene.time.delayedCall( 200, () => {
        this.headSprite.visible = true;
        this.bodySprite.visible = true;
        this.hurtSprite.visible = false;
        this.scene.time.delayedCall( 400, () => {
          this.flashTween.pause();
          this.headSprite.clearTint();
          this.bodySprite.clearTint();
          this.hurtSprite.clearTint();
          this.flash = false;
          this.invincible = false;
        } );
      } );
    }
  }

  /**
   * Kills the player and ends the game.
   * 
   * Called when the player's health is <0.
   */
  dead() {
    this.hurtSprite.anims.play( "bird_die" ); // Plays a death animation
    this.alive = false;
    this.scene.physics.world.disable( this );
    this.hitbox.destroy();
    this.setActive( false );

    // Destroys super laser if it is being shot
    if ( this.start != null ) {
      this.start.destroy();
      this.middle.destroy();
      this.end.destroy();
    }

    // After the death animation is completed, the player emits a signal to end the game
    this.hurtSprite.once( "animationcomplete", () => {
      this.scene.playerDead = true;
      this.scene.deathEmitter.emit( "playerDead" );
    } );
  }
}