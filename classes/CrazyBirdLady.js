class CrazyBirdLady extends Phaser.GameObjects.Sprite {
  /**
   * Boss of the game.
   * 
   * Has two phases, transitions to next phase at 50%.
   * First phase either summons Good Drawings that chase the player until 
   * killed, or chases player around before stopping for a few seconds.
   * Second phase either summons nets down from the top of the screen or chases player around at a faster speed.
   * Killing the boss allows the player to proceed to the next level.
   */
  constructor( scene, x, y ) {
    super( scene, x, y, 'crazyBirdLady_idle' );
    this.scene = scene;
    this.scene.physics.world.enable( this );
    this.scene.add.existing( this );
    this.anims.play( 'crazyBirdLady_idle' );

    // Body
    this.body.setSize( 40, 5 );
    this.body.offset.x = 27;
    this.body.offset.y = 88;

    // Head hitbox
    this.hitbox = this.scene.physics.add.image( this.x, this.y + 9 );
    this.hitbox.body.setSize( 35, 38 );
    this.hitbox.body.immovable = true;
    this.hitbox.setDebugBodyColor( 0xffff00 );
    this.hitbox.parent = this;

    // Body hitbox
    this.hitbox2 = this.scene.physics.add.image( this.x, this.y + 35 );
    this.hitbox2.body.setSize( 2, 15 );
    this.hitbox2.body.immovable = true;
    this.hitbox2.setDebugBodyColor( 0xffff00 );
    this.hitbox2.parent = this;

    // Variables
    this.alive = true;
    this.startedFighting = false;
    this.flash = false;
    this.targetFlash = false;
    this.health = 500 + 10 * ( this.scene.level - 1 );
    this.maxHealth = this.health;
    this.phase = 1;
    this.chasing = false;
    this.chaseSpeed = 80;
    this.chaseSpeed2 = 100;
    this.takenKB = 1;

    // Creates nets that will be used in summon attack
    this.createNets();

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

    // Collider with map
    this.scene.physics.add.collider( this, this.scene.groundLayer );

    // Collider with player
    this.scene.physics.add.overlap( this.hitbox, this.scene.player.hitbox, ( crazyBirdLady, player ) => { // Head hitbox
      if ( this.phase == 1 ) {
        player.player.hurt( 'normal' );
      } else if ( this.phase == 2 ) {
        player.player.hurt( 'strong' );
      }
    } );
    this.scene.physics.add.overlap( this.hitbox2, this.scene.player.hitbox, ( crazyBirdLady, player ) => { // Body hitbox
      if ( this.phase == 1 ) {
        player.player.hurt( 'normal' );
      } else if ( this.phase == 2 ) {
        player.player.hurt( 'strong' );
      }
    } );
  }

  preUpdate( time, delta ) {
    super.preUpdate( time, delta );
  }

  update() {
    if ( this.alive ) {
      // Updates velocity of both hitboxes with boss' movement
      this.hitbox.body.velocity.copy( this.body.velocity );
      this.hitbox2.body.velocity.copy( this.body.velocity );

      this.flip();
      this.chase();

    }
    this.depth = this.y + this.height / 2;
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Calls idle() to start the boss' attack patterns.
   */
  startFight() {
    this.startedFighting = true;
    this.idle();
  }

  /**
   * Stands still and waits for a delay before calling decideAttack().
   */
  idle() {
    if ( this.alive ) {
      const delay = Phaser.Math.Between( 1000, 2000 ); // Random delay between 1-2 seconds before this.timer fires
      this.body.reset( this.x, this.y );

      if ( this.phase == 1 ) {
        this.anims.play( 'crazyBirdLady_idle', true );
      } else if ( this.phase == 2 ) {
        this.anims.play( 'crazyBirdLady_sad_idle', true );
      }

      this.timer = this.scene.time.delayedCall( delay, () => this.decideAttack() );
    }
  }

  /**
   * Chooses an attack to perform depending on phase.
   */
  decideAttack() {
    if ( !this.alive ) { // Exits loop if dead
      return;
    }

    const randNum = Phaser.Math.Between( 1, 2 ); // 50/50 chance of either possible attack
    if ( randNum == 1 ) {
      // Changing this.chasing to true satisfies a condition in chase() in the update loop, making the boss chase after the player
      this.chasing = true;
      this.chaseDelayedCalls(); // Creates delayed calls that stop the boss from chasing after a set amount of time
    } else if ( randNum == 2 ) {
      if ( this.phase == 1 ) {
        this.summonGoodDrawings();
      } else {
        this.summonNets();
      }
    }
  }

  /**
   * Chases the player at set speed when this.chasing is true.
   * 
   * Called in every update loop but this.chasing is only satisfied when the boss decides to use the chase attack.
   */
  chase() {
    if ( this.chasing && this.scene.player.alive ) {
      // Shifts the body hitbox depending on which way the boss is flipped
      if ( this.flipX ) {
        this.hitbox2.x = this.x - 17;
      } else {
        this.hitbox2.x = this.x + 17;
      }

      // Chases the player at different speeds depending on the phase
      if ( this.phase == 1 ) {
        this.anims.play( 'crazyBirdLady_chase', true );
        this.scene.physics.moveToObject( this, this.scene.player, this.chaseSpeed );
      } else {
        this.anims.play( 'crazyBirdLady_sad_chase', true );
        this.scene.physics.moveToObject( this, this.scene.player, this.chaseSpeed2 );
      }
    }
  }

  /**
   * Creates timers to stop boss' chase attack after a set amount of time.
   * 
   * First timer makes the boss stop chasing. Second timer is started after the first timer fires
   * and calls idle() to continue the attack loop. 
   */
  chaseDelayedCalls() {
    const stopDelay = 3000;
    const idleDelay = 2000;

    if ( this.phase == 1 ) {
      this.scene.scene.get( 'audio' ).playSFX( 'crazyBirdLady_chase_1' );
    } else if ( this.phase == 2 ) {
      this.scene.scene.get( 'audio' ).playSFX( 'crazyBirdLady_chase_2' );
    }

    this.timer = this.scene.time.delayedCall( stopDelay, () => {

      // Prevents chase() from moving boss anymore
      this.chasing = false;

      // Stops boss from moving and resets body hitbox to middle
      this.body.reset( this.x, this.y );
      this.hitbox2.x = this.x;

      if ( this.phase == 1 ) {
        this.anims.play( 'crazyBirdLady_rest', true );
        this.scene.scene.get( 'audio' ).playSFX( 'crazyBirdLady_rest_1' );
      } else if ( this.phase == 2 ) {
        this.anims.play( 'crazyBirdLady_sad_rest', true );
        this.scene.scene.get( 'audio' ).playSFX( 'crazyBirdLady_rest_2' );
      }

      // Second timer to call idle() after delay
      this.timer = this.scene.time.delayedCall( idleDelay, () => this.idle() );
    } );
  }

  /**
   * Summons Good Drawings in random locations in boss room.
   * 
   * Summons Good Drawing enemies around room. The Good Drawings are only spawned around a 3x3 box of tiles
   * around the player to prevent them from spawning above the player.
   */
  summonGoodDrawings() {
    const {
      left,
      right,
      top,
      bottom
    } = this.scene.bossRoom;
    const numEnemies = Phaser.Math.Between( this.scene.level, this.scene.level + 4 ); // Number of enemies spawned increases as the player progresses
    var enemiesCreated = 0;
    var playerTileX = this.scene.groundLayer.worldToTileX( this.scene.player.x );
    var playerTileY = this.scene.groundLayer.worldToTileY( this.scene.player.y );
    var tilesAroundPlayer = this.scene.groundLayer.getTilesWithin( playerTileX - 1, playerTileY - 1, 3, 3 ); // 3x3 box around player

    // Spawns Good Drawings in random locations around the room (except in the 3x3 box around player) until the number of enemies created is equal to the number of enemies to be created
    while ( enemiesCreated != numEnemies ) {
      var x = Phaser.Math.Between( this.scene.groundLayer.tileToWorldX( left + 1 ), this.scene.groundLayer.tileToWorldX( right - 1 ) );
      var y = Phaser.Math.Between( this.scene.groundLayer.tileToWorldY( top + 1 ), this.scene.groundLayer.tileToWorldY( bottom - 1 ) );
      var spawnTile = this.scene.groundLayer.getTileAtWorldXY( x, y, true );

      // Creates Good Drawing if the tile the Good Drawing is to be spawned on is not in the 3x3 box
      if ( tilesAroundPlayer.includes( spawnTile ) == false ) {
        var goodDrawing = new GoodDrawing( this.scene, x, y );
        this.scene.enemyGroup.add( goodDrawing );
        enemiesCreated++;
      }
    }

    this.scene.scene.get( 'audio' ).playSFX( 'crazyBirdLady_summon_goodDrawing' );

    this.timer = this.scene.time.delayedCall( 2000, () => {
      this.idle();
    } );
  }

  /**
   * Creates the nets that will be used by the boss and adds them to a group.
   */
  createNets() {
    this.netGroup = this.scene.add.group( {
      runChildUpdate: true
    } );
    this.netGroup.createMultiple( {
      classType: Net,
      key: 'net_frames',
      frameQuantity: 50,
      active: false,
      visible: false
    } );
  }

  /**
   * Summons nets on the floor of the boss room that damage the player.
   */
  summonNets() {
    const delay = 2000;
    this.scene.scene.get( 'audio' ).playSFX( 'crazyBirdLady_summon_net_1' );
    this.anims.play( 'crazyBirdLady_summonAttack_raiseArm' );

    this.once( 'animationcomplete', () => {
      // Plays an animated loop with raised arm while targets appear
      this.anims.play( 'crazyBirdLady_summonAttack_raiseLoop' );
      this.targetsAppear();

      this.timer = this.scene.time.delayedCall( delay, () => {

        // Summons nets after delay!
        this.anims.play( 'crazyBirdLady_summonAttack_lowerArm' );
        this.scene.scene.get( 'audio' ).playSFX( 'crazyBirdLady_summon_net_2' );
        this.netsFall();

        this.once( 'animationcomplete', () => {
          this.idle(); // Resumes attack loop
        } );
      } );
    } );
  }

  /**
   * Gets a number of inactive nets in the group of nets and calls targetGround() in the Net class for each net.
   */
  targetsAppear() {
    const netNum = this.scene.level + 5; // Number of nets increases as player progresses
    for ( let i = 0; i < netNum; i++ ) {
      var net = this.netGroup.getFirstDead( true );
      net.targetGround();
    }
  }

  /**
   * Makes the nets fall from the top of the screen onto the ground by calling fall() in the Net class for each net.
   */
  netsFall() {
    this.netGroup.children.each( ( net ) => {
      if ( net.active && !net.falling && !net.landed ) { // Filters through the group for the required nets; Only nets that are active and not part of previous attack
        net.fall();
      }
    } );
  }

  /**
   * Damages boss and knocks it back.
   * 
   * Passed damage is subtracted from boss' health. If the boss' new health is <50% it enters the next phase.
   * If new health is <0 then dead() is called to kill the boss. Boss is also knocked back slightly in the passed
   * direction.
   */
  hurt( damage, direction ) {
    if ( this.startedFighting && this.alive ) { // Boss only takes damage after fight starts so the player can't get sneak shots in from outside the boss room.
      this.health -= damage;

      // Plays flash tween 
      this.flashTween.play();

      // Shifts coordinates of all 3 bodies to knock boss back
      // Only takes KB in phase 1
      if ( direction != null && this.phase == 1 ) {
        switch ( direction ) {
          case 'up':
            this.y -= this.takenKB;
            this.hitbox.y -= this.takenKB;
            this.hitbox2.y -= this.takenKB;
            break;
          case 'right':
            this.x += this.takenKB;
            this.hitbox.x += this.takenKB;
            this.hitbox2.x += this.takenKB;
            break;
          case 'down':
            this.y += this.takenKB;
            this.hitbox.y += this.takenKB;
            this.hitbox2.y += this.takenKB;
            break;
          case 'left':
            this.x -= this.takenKB;
            this.hitbox.x -= this.takenKB;
            this.hitbox2.x -= this.takenKB;
            break;
        }
      }

      // Changes phase is health is <50% and the boss is still in phase 1
      if ( this.health <= this.maxHealth / 2 && this.phase == 1 ) {
        this.changePhase();
      }

      // Kills boss if boss is alive and health is <0
      if ( this.health <= 0 && this.alive ) {
        this.dead();
      }
    }
  }

  /**
   * Transitions boss to phase 2.
   * 
   * In phase 2 the boss has slightly different attacks, different animations and no longer takes any knockback.
   * Upon calling this function the boss stops moving and plays a transition animation, and once the animation is 
   * complete, idle() is called to continue the attack loop.
   */
  changePhase() {
    this.phase = 2;
    this.chasing = false;
    this.body.reset( this.x, this.y );
    this.hitbox2.x = this.x;
    this.anims.pause();
    this.timer.remove(); // Removes any timers that may currently be active to prevent them from firing at the wrong time
    this.anims.play( 'crazyBirdLady_changePhase' );

    // Detune both possible music tracks to create a more sinister atmosphere
    this.scene.scene.get( 'audio' ).music_boss_fight.setDetune( -1200 );
    this.scene.scene.get( 'audio' ).music_fart.setDetune( -1200 );

    this.once( 'animationcomplete', () => this.idle() );
  }

  /**
   * Kills the boss.
   * 
   * Disables/removes things associated with the boss then plays the death animation.
   */
  dead() {
    // Removes the boss from the world and freezes it
    this.alive = false;
    this.chasing = false;
    this.scene.scene.get( 'audio' ).stop();

    this.scene.scoreEmitter.emit( 'addScore', 690 );
    this.scene.bossDead = true;
    this.anims.pause(); // Pauses animations instead of stopping to prevent it from firing 'animationcomplete'
    this.timer.remove(); // Removes any timers that may currently be active
    this.scene.physics.world.disable( this );
    this.scene.playerEnemyRaycaster.removeMappedObjects( this.hitbox );
    this.scene.playerEnemyRaycaster.removeMappedObjects( this.hitbox2 );
    this.hitbox.body.destroy();
    this.hitbox2.body.destroy();

    // Removes all timers from all nets then destroys everything in the net group
    this.netGroup.children.each( ( net ) => {
      if ( net.timer ) {
        net.timer.remove();
      }
    } );
    this.netGroup.clear( true, true );

    // Kills every enemy in the level
    this.scene.enemyGroup.children.each( ( enemy ) => {
      enemy.kill();
    } );

    this.deathAnimation();
  }

  /**
   * Plays a death animation then destroys the boss.
   * 
   * Plays an animation sequence with delays between each 
   * animation and then calls spawnRock() from the game scene.
   */
  deathAnimation() {
    const standLength = 1000;
    const sitLength = 2000;

    this.anims.play( 'crazyBirdLady_die_stand' );
    this.scene.scene.get( 'audio' ).playSFX( 'crazyBirdLady_die' );

    this.scene.time.delayedCall( standLength, () => {
      this.anims.play( 'crazyBirdLady_die_fall' );

      this.once( 'animationcomplete', () => {
        this.anims.play( 'crazyBirdLady_die_sit' );

        // Spawn a rock that lets the player advance to the next level
        this.scene.time.delayedCall( sitLength, () => {
          // Reset the detune of the music tracks
          this.scene.scene.get( 'audio' ).music_boss_fight.setDetune( 0 );
          this.scene.scene.get( 'audio' ).music_fart.setDetune( 0 );
          this.scene.scene.get( 'audio' ).playMusic( 'boss_dead' );
          this.scene.spawnRock();
        } );
      } );
    } );
  }

  /**
   * Flips the boss sprite depending on velocity.
   */
  flip() {
    if ( this.body.velocity.x > 0 ) {
      this.setFlipX( true );
    } else if ( this.body.velocity.x < 0 ) {
      this.setFlipX( false );
    }
  }
}