class GoodDrawing extends Phaser.GameObjects.Sprite {
  /**
   * A weak, simple enemy summoned by the Crazy Bird Lady boss in its first phase.
   * 
   * Chases after the player and does contact damage.
   */
  constructor( scene, x, y ) {
    super( scene, x, y, 'goodDrawing' );
    this.scene = scene;
    this.scene.physics.world.enable( this );
    this.scene.add.existing( this );

    // Body
    this.body.setSize( 23, 4 );
    this.body.offset.x = 13;
    this.body.offset.y = 26;

    // Hitbox
    this.hitbox = this.scene.physics.add.image( this.x, this.y + 2 );
    this.hitbox.body.immovable = true;
    this.hitbox.body.setSize( 20, 12 );
    this.hitbox.setDebugBodyColor( 0xffff00 );
    this.hitbox.parent = this;
    this.scene.enemyHitboxGroup.add( this.hitbox );

    // Variables
    this.alive = true;
    this.health = 10 + ( this.scene.level - 1 ) * 5;
    this.chaseSpeed = 60;
    this.canChase = false;
    this.takenKB = 8;

    // Colliders
    this.scene.physics.add.overlap( this.hitbox, this.scene.player.hitbox, ( goodDrawing, player ) => player.player.hurt( 'normal' ) ); // Damages player with normal damage on overlap
    this.scene.physics.add.collider( this, this.scene.groundLayer ); // Collides good drawing with wall

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
  }

  update() {
    if ( this.alive ) {
      // Updates hitbox to move with the good drawing
      this.hitbox.x = this.x;
      this.hitbox.y = this.y;
      this.hitbox.body.velocity.copy( this.body.velocity );

      // Chases after player if canChase is true
      if ( this.canChase ) {
        this.chase();
        this.flip();
      }
    }
    this.depth = this.y + this.height / 2;
  }

  /* ---------------------------- Custom Functions ---------------------------- */

  /**
   * Spawns the good drawing and creates a timer which allows the good drawing to move after firing.
   * 
   * Spawns the good drawing with a smoke effect and creates a timer. After 
   * a delay, canChase is set to true, which allows the good drawing to move.
   */
  spawned() {
    // Allows the mapping of this good drawing's hitbox by the player's ray caster to allow it to be hit by the super laser
    this.scene.playerEnemyRaycaster.mapGameObjects( this.hitbox, true );

    // Spawns an animated smoke sprite
    var smoke = this.scene.add.sprite( this.x, this.y, 'smoke' );
    smoke.anims.play( 'smoke' );
    smoke.parent = this; // Adds itself as a variable to the smoke sprite to reference itself in the following event listener

    // Destroy smoke and set this.canChase to true
    smoke.once( 'animationcomplete', () => {
      smoke.destroy();
      smoke.parent.canChase = true;
    } );
  }

  /**
   * Makes good drawing chase player.
   */
  chase() {
    if ( !this.scene.player.alive ) {
      return;
    }
    this.anims.play( 'goodDrawing_run', true );
    this.scene.physics.moveToObject( this, this.scene.player, this.chaseSpeed );
  }

  /**
   * Flips sprite depending on velocity
   */
  flip() {
    if ( this.body.velocity.x > 0 ) {
      this.setFlipX( true );
    } else if ( this.body.velocity.x < 0 ) {
      this.setFlipX( false );
    }
  }

  /**
   * Decreases health and knocks good drawing back.
   * 
   * Subtracts passed damage value from good drawing's health and knocks
   * it back slightly depending on passed direction. If the new health value is <0, 
   * dead() is called to kill the good drawing.
   */
  hurt( damage, direction ) {
    this.health -= damage;
    this.flashTween.play();

    if ( direction != null && this.canChase ) { // Prevents knockback until it starts to chase the player
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
   * Plays a death animation and destroys the good drawing.
   * 
   * Removes things associated with this good drawing.
   */
  dead() {
    this.alive = false;
    this.anims.play( 'goodDrawing_die' );
    this.scene.scoreEmitter.emit( 'addScore', 1 ); // Adds a small amount to the player's score upon death
    this.scene.physics.world.disable( this );
    this.scene.playerEnemyRaycaster.removeMappedObjects( this.hitbox ); // Removes its hitbox from the player's ray caster's mapped objects
    this.hitbox.destroy();
    this.scene.scene.get( 'audio' ).playSFX( 'crazyBirdLady_goodDrawing_die' );

    this.once( 'animationcomplete', () => this.destroy() );
  }

  /**
   * Destroys the good drawing without playing a death animation.
   */
  kill() {
    this.scene.playerEnemyRaycaster.removeMappedObjects( this.hitbox );
    this.destroy();
    this.hitbox.destroy();
  }
}