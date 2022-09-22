class Game extends Phaser.Scene {
  /**
   * The game.
   * 
   * Creates a dungeon and spawns in the game objects
   * that will be in it. Game is played by controlling
   * a bird character in a dungeon. The aim is to get
   * the highest possible score before dying. The score
   * decreases every second so the player needs to kill
   * as fast as possible. Enemies will spawn in each room
   * of the dungeon, and to proceed to the next level,
   * the player needs to kill the boss, who can be found
   * in a random room in every level. As the player progresses
   * more enemies spawn and the boss becomes slightly stronger.
   * The game ends when the player loses all their health.
   * 
   * Things that increase score:
   * - Killing enemies
   * - Killing the boss
   * - Collecting a pickup
   * 
   * Things that decrease score:
   * - Taking damage
   * - Every second, score decreases
   */
  constructor() {
    super( "game" );

    // Constants
    this.scoreDecrement = 3;
    this.delayBeforeEnd = 3000;
  }

  create() {
    this.createVariables();
    this.addKeys();
    this.checkIfFart();
    this.createDungeon();
    this.createRaycasters();
    this.createPlayer();
    this.putThingsInRooms();
    this.createLasers();
    this.createEnergyBalls();
    this.createPickups();
    this.createScoreTimer();
    this.createScoreEmitter();
    this.createPlayerDeathEmitter();
    this.createClock();
    this.mapRayObjects();
    this.createColliders();
    this.addTotalRuns();

    // Adds the overlay
    this.scene.run( "overlay", this );
  }

  update() {
    // Updates the player and boss because they aren't part of a group
    this.player.update();
    this.boss.update();

    this.findPlayerRoom();
    this.checkIfInBossRoom();
    this.gamePause();
  }

  /* ---------------------------- Custom Functions ---------------------------- */


  /**
   * Creates essential variables that will be used in the game.
   */
  createVariables() {
    this.level = 1;
    this.score = 666;
    this.bossFightInitiated = false;
    this.bossDead = false;
    this.playerDead = false;
    this.kills = 0;
    this.timeElapsed = 0;
    this.formattedTime = 0;
    this.enemyHitboxGroup = this.add.group(); // Group that contains all enemy hitboxes
    this.laserHitboxGroup = this.add.group(); // Group that contains all laser hitboxes
  }

  /**
   * Adds keys that will be used in the game.
   */
  addKeys() {
    this.keyEscape = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ESC );
    this.keyEnter = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.ENTER );
  }

  /**
   * If the '???' option is set to 69, all SFX are replaced with fart sounds
   * and the music track is replaced with a fart themed track.
   * 
   * Plays a music track if the track is not already playing. 
   * Also plays a music track if fart sounds are on, because the music automatically gets 
   * changed to the fart track.
   */
  checkIfFart() {
    if ( this.scene.get( 'gameMenu' ).jsonDetails.options.unknown == 69 ) {
      this.scene.get( 'audio' ).fartSounds = true;
    } else {
      this.scene.get( 'audio' ).fartSounds = false;
    }

    if ( !this.scene.get( 'audio' ).music_dungeon.isPlaying || this.scene.get( 'audio' ).fartSounds == true ) {
      if ( this.bossDead ) {
        this.scene.get( 'audio' ).playMusic( 'boss_dead' );
      } else if ( this.bossFightInitiated ) {
        this.scene.get( 'audio' ).playMusic( 'boss_fight' );
      } else {
        this.scene.get( 'audio' ).playMusic( 'dungeon' );
      }
    }
  }

  /**
   * Creates raycasters that will be used by the enemies and player.
   */
  createRaycasters() {
    // Enemy raycaster
    this.raycaster = this.raycasterPlugin.createRaycaster();

    // Player raycasters
    this.playerTileRaycaster = this.raycasterPlugin.createRaycaster();
    this.playerEnemyRaycaster = this.raycasterPlugin.createRaycaster();
  }

  /**
   * Maps selected objects for the enemy and player raycasters.
   * 
   * Enemy raycaster will map the player and colliding tiles.
   * Player has two raycasters, one of which maps colliding tiles,
   * while the other maps enemy and boss hitboxes.
   */
  mapRayObjects() {
    this.raycaster.mapGameObjects( this.player );
    this.raycaster.mapGameObjects( this.player.hitbox );
    this.raycaster.mapGameObjects( this.groundLayer, true, {
      collisionTiles: [ tiles.blank ]
    } );

    this.playerTileRaycaster.mapGameObjects( this.groundLayer, true, {
      collisionTiles: [ tiles.blank ]
    } );
    this.playerEnemyRaycaster.mapGameObjects( this.boss.hitbox2, true );
    this.playerEnemyRaycaster.mapGameObjects( this.boss.hitbox, true );
    this.playerEnemyRaycaster.mapGameObjects( this.enemyHitboxGroup.getChildren(), true );
  }

  /**
   * Creates a timer that records the amount of time the game has been running.
   */
  createClock() {
    this.totalTimeTimer = this.time.addEvent( {
      delay: 1000,
      callback: () => this.timeElapsed += 1000,
      loop: true
    } );
  }

  /**
   * Adds 1 to the total number of runs.
   * 
   * The total number of runs is located in the JSON file, which
   * is obtained from the game menu and written back into the 
   * file after the 1 is added.
   */
  addTotalRuns() {
    this.jsonDetails = this.scene.get( "gameMenu" ).jsonDetails;
    this.jsonDetails.totalRuns++;
    fs.writeFile( "info.json", JSON.stringify( this.jsonDetails, null, 2 ), function ( err ) {
      if ( err ) throw err;
    } );
  }

  /**
   * Finds the current room the player is in.
   * 
   * Assigns the room to this.playerRoom.
   */
  findPlayerRoom() {
    var x = this.groundLayer.worldToTileX( this.player.x );
    var y = this.groundLayer.worldToTileY( this.player.y );
    this.playerRoom = this.dungeon.getRoomAt( x, y );
  }

  /**
   * Starts the boss fight if the player enters the boss room.
   * 
   * Compares this.playerRoom with the designated boss room and
   * starts fight if they are the same room.
   */
  checkIfInBossRoom() {
    if ( this.playerRoom == this.bossRoom && !this.bossFightInitiated ) {
      this.startBossIntro();
    }
  }

  /**
   * Spawns a rock in the middle of the boss room to let the player advance to the next level.
   * 
   * Called after the boss dies.
   */
  spawnRock() {
    this.objectLayer.putTileAt( tiles.rock, this.bossRoom.centerX, this.bossRoom.centerY );

    // Sets the tile overlap callback to the transition to the next level
    this.objectLayer.setTileIndexCallback( tiles.rock, () => {
      this.objectLayer.setTileIndexCallback( tiles.rock, null );
      this.player.body.moves = false; // Prevents player from moving while transitioning

      // Use fade effect to transition to next level
      this.cameras.main.fade( 250, 0, 0, 0 );
      this.cameras.main.once( "camerafadeoutcomplete", () => this.startNextLevel() );
    } );
  }

  /**
   * Restarts the game with a completely new dungeon.
   * 
   * Called when the player touches the rock after the boss
   * fight. Spawns a new dungeon, new enemies and new boss.
   */
  startNextLevel() {
    this.scene.get( "audio" ).playMusic( "dungeon" );

    this.cameras.main.fadeIn( 250, 0, 0, 0 );
    this.cameras.main.once( "camerafadeincomplete", () => this.player.body.moves = true ); // Allows player to move after transition is complete

    // Resets some variables while incrementing the level
    this.level++;
    this.playerRoom = null;
    this.bossRoom = null;
    this.bossFightInitiated = false;
    this.bossDead = false;

    // Destroys all old colliders
    this.physics.world.colliders.destroy();

    // Clears every group and destroys the contents
    this.enemyGroup.clear( true, true );
    this.laserGroup.clear( true, true );
    this.energyBallGroup.clear( true, true );
    this.pickupGroup.clear( true, true );
    this.laserHitboxGroup.clear( true, true );
    this.enemyHitboxGroup.clear( true, true );
    this.boss.destroy();

    this.createDungeon();
    this.createRaycasters();
    this.putThingsInRooms();
    this.createLasers();
    this.createEnergyBalls();
    this.createPickups();
    this.resetPlayerLocation();
    this.mapRayObjects();
    this.createColliders();
    this.player.resetRays();
  }

  /**
   * Plays the boss intro before a boss fight.
   * 
   * Called when the player enters the boss room.
   */
  startBossIntro() {
    this.scene.get( 'audio' ).stop();
    this.scene.get( "audio" ).playSFX( "boss_intro" );
    this.scoreTimerPause = true;
    this.scoreDecreaseTimer.paused = true;
    this.scene.pause();
    this.scene.pause( 'overlay' );
    this.input.keyboard.resetKeys();
    this.scene.run( "bossIntro" );
    this.bossFightInitiated = true;
  }

  /**
   * Prepares the boss fight.
   * 
   * Fills in the door connecting the boss room
   * to the outside to prevent escape. Teleports
   * the player to the centre of the room and slightly
   * down.
   */
  startBossFight() {
    const {
      left,
      right,
      bottom
    } = this.bossRoom;

    this.scene.get( "audio" ).playMusic( "boss_fight" );

    // Begins the attack loop of the boss
    this.boss.startFight();

    var x = this.groundLayer.tileToWorldX( ( left + right + 1 ) / 2 );
    var y = this.groundLayer.tileToWorldY( bottom - 3 );
    this.player.body.reset( x, y );

    this.fillInBossDoor();
  }

  /**
   * Fills in the doorway when the boss fight starts so the player can't run away.
   */
  fillInBossDoor() {
    const {
      width,
      height,
      left,
      right,
      top,
      bottom
    } = this.bossRoom;
    var door = this.bossRoom.getDoorLocations()[ 0 ]; // There is only one door to the boss room so the first instance is the only

    // Arrays of the indexes of the tiles with one of two brick texture styles
    // They require different top layer tiles because of different patterns
    const type1Array = [ 41, 58, 65, 74 ];
    const type2Array = [ 49, 50, 57, 66, 73 ];

    // Fills in tiles depending on where the door is
    // First two are explained and the following two are similar to the aforementioned
    if ( door.y == 0 ) { // Top
      // Fills in the walls of the boss room and the room above the boss room
      this.roomBottomWallLayer.weightedRandomize( left + door.x - 1, top - 1, 3, 1, tiles.wall.topBottom );
      this.roomTopWallLayer.weightedRandomize( left + door.x - 1, top, 3, 1, tiles.wall.topBottom );

      // Places a blank tile where the door was
      this.groundLayer.putTileAt( tiles.blank, left + door.x, top );

      // Loops through each wall tile in the boss room and uses the defined arrays to determine
      // which brick texture style they are, then places the top layer tile above each
      this.roomTopWallLayer.forEachTile( ( tile ) => {
        if ( type1Array.includes( tile.index ) ) {
          this.topWallTopLayer.putTileAt( tiles.wallTop.type1, tile.x, tile.y - 1 );
        } else if ( type2Array.includes( tile.index ) ) {
          this.topWallTopLayer.putTileAt( tiles.wallTop.type2, tile.x, tile.y - 1 );
        }
      }, this, left + door.x - 1, top, 3, 1 );

      // Same as previous but loops through the bottom wall of the room above the boss room
      this.roomBottomWallLayer.forEachTile( ( tile ) => {
        if ( type1Array.includes( tile.index ) ) {
          this.bottomWallTopLayer.putTileAt( tiles.wallTop.type1, tile.x, tile.y - 1 );
        } else if ( type2Array.includes( tile.index ) ) {
          this.bottomWallTopLayer.putTileAt( tiles.wallTop.type2, tile.x, tile.y - 1 );
        }
      }, this, left + door.x - 1, top - 1, 3, 1 );
    } else if ( door.x == 0 ) { // Left
      // Fills in the wall tiles of the left side of the boss room and the right side of the room
      // to the left of the boss room
      this.roomSideWallLayer.weightedRandomize( left, top + door.y - 1, 1, 3, tiles.wall.left );
      this.roomSideWallLayer.weightedRandomize( left - 1, top + door.y - 1, 1, 3, tiles.wall.right );

      // Fills the doorway with blank tiles
      this.groundLayer.fill( tiles.blank, left - 1, top + door.y, 2, 2 );

      // Removes the top layer tiles of the doorway
      this.topWallTopLayer.forEachTile( ( tile ) => {
        this.topWallTopLayer.removeTileAt( tile.x, tile.y );
        this.bottomWallTopLayer.removeTileAt( tile.x, tile.y );
        this.roomBottomWallLayer.removeTileAt( tile.x, tile.y );
      }, this, left - 1, top + door.y - 2, 2, 4 );
    } else if ( door.x == width - 1 ) { // Right
      this.roomSideWallLayer.weightedRandomize( right, top + door.y - 1, 1, 3, tiles.wall.right );
      this.roomSideWallLayer.weightedRandomize( right + 1, top + door.y - 1, 1, 3, tiles.wall.left );
      this.groundLayer.fill( tiles.blank, right, top + door.y, 2, 2 );
      this.topWallTopLayer.forEachTile( ( tile ) => {
        this.topWallTopLayer.removeTileAt( tile.x, tile.y );
        this.bottomWallTopLayer.removeTileAt( tile.x, tile.y );
        this.roomBottomWallLayer.removeTileAt( tile.x, tile.y );
      }, this, right, top + door.y - 2, 2, 4 );
    } else if ( door.y == height - 1 ) { // Bottom
      this.roomBottomWallLayer.weightedRandomize( left + door.x - 1, bottom, 3, 1, tiles.wall.topBottom );
      this.roomTopWallLayer.weightedRandomize( left + door.x - 1, bottom + 1, 3, 1, tiles.wall.topBottom );
      this.groundLayer.putTileAt( tiles.blank, left + door.x, bottom + 1 );
      this.roomBottomWallLayer.forEachTile( ( tile ) => {
        if ( type1Array.includes( tile.index ) ) {
          this.bottomWallTopLayer.putTileAt( tiles.wallTop.type1, tile.x, tile.y - 1 );
        } else if ( type2Array.includes( tile.index ) ) {
          this.bottomWallTopLayer.putTileAt( tiles.wallTop.type2, tile.x, tile.y - 1 );
        }
      }, this, left + door.x - 1, bottom, 3, 1 );
      this.roomTopWallLayer.forEachTile( ( tile ) => {
        if ( type1Array.includes( tile.index ) ) {
          this.topWallTopLayer.putTileAt( tiles.wallTop.type1, tile.x, tile.y - 1 );
        } else if ( type2Array.includes( tile.index ) ) {
          this.topWallTopLayer.putTileAt( tiles.wallTop.type2, tile.x, tile.y - 1 );
        }
      }, this, left + door.x - 1, bottom + 1, 3, 1 );
    }

    // Reset collisions so the player collides with the newly placed blank tiles
    this.groundLayer.setCollision( tiles.blank );
  }

  /**
   * Creates our player bird!
   * 
   * Adds the player to the scene in the middle of the map and
   * makes the camera follow it.
   */
  createPlayer() {
    this.player = new Player( {
      scene: this,
      x: this.map.widthInPixels / 2,
      y: this.map.heightInPixels / 2,
    } );

    this.cameras.main.startFollow( this.player );
    this.cameras.main.setBounds( 0, 0, this.map.widthInPixels, this.map.heightInPixels ); // Prevents the camera from moving off the map
  }

  /**
   * Resets the player's coordinates back to the centre of the map.
   * 
   * Called when the player moves to the next level.
   */
  resetPlayerLocation() {
    this.player.body.reset( this.map.widthInPixels / 2, this.map.heightInPixels / 2 );
  }

  /**
   * Creates 50 lasers and adds them to the laser group for the player to use.
   */
  createLasers() {
    this.laserGroup = this.add.group( {
      runChildUpdate: true,
    } );
    this.laserGroup.createMultiple( {
      classType: Laser,
      key: "laser_frames",
      frameQuantity: 50,
      active: false,
      visible: false,
    } );
  }

  /**
   * Creates 50 energy balls and adds them to the energy ball group for the lizard demons to use.
   */
  createEnergyBalls() {
    this.energyBallGroup = this.add.group( {
      runChildUpdate: true,
    } );
    this.energyBallGroup.createMultiple( {
      classType: EnergyBall,
      key: "energyBallFloat_frames",
      frameQuantity: 50,
      active: false,
      visible: false,
    } );
  }

  /**
   * Creates 50 pickups and adds them into the pickup group for when enemies are to drop a pickup.
   */
  createPickups() {
    this.pickupGroup = this.add.group( {
      runChildUpdate: true,
    } );
    this.pickupGroup.createMultiple( {
      classType: Pickup,
      key: "drop_frames",
      frameQuantity: 50,
      active: false,
      visible: false,
    } );
  }

  /**
   * Adds enemies and the boss to the dungeon.
   * 
   * Selects a room with one doorway to be the boss room, and
   * prevents enemies from being added to the starting room
   * and boss room.
   */
  putThingsInRooms() {
    var rooms = this.dungeon.rooms;

    // Removes the starting room from array
    rooms.shift();

    // Removes a random room with 1 door from array as the boss room
    do {
      this.bossRoom = Phaser.Utils.Array.GetRandom( rooms );
    } while ( this.bossRoom.getDoorLocations().length != 1 );
    Phaser.Utils.Array.Remove( rooms, this.bossRoom );

    // Creates enemies in the rest of the rooms and creates boss in boss room
    this.createEnemies( rooms );
    this.createBoss( this.bossRoom );
  }

  /**
   * Creates enemies and spawns them into the available dungeon rooms.
   * 
   * The numbers of enemies spawned in each room changes with the level.
   */
  createEnemies( rooms ) {
    this.enemyGroup = this.add.group( {
      runChildUpdate: true,
      active: true,
      visible: true,
      createCallback: ( enemy ) => enemy.spawned()
    } );

    rooms.forEach( ( room ) => {
      const {
        left,
        right,
        top,
        bottom
      } = room;

      // Increases the range of enemy numbers in each room depending on level ;)
      var min = 1 + ( this.level - 1 );
      var max = 3 + ( this.level - 1 );
      const numEnemies = Phaser.Math.Between( min, max );

      // Spawns the defined number of enemies and adds each created enemy to the enemy group
      for ( let i = 0; i < numEnemies; i++ ) {
        const x = Phaser.Math.Between( this.map.tileToWorldX( left + 3 ), this.map.tileToWorldX( right - 3 ) );
        const y = Phaser.Math.Between( this.map.tileToWorldY( top + 3 ), this.map.tileToWorldY( bottom - 3 ) );
        const randNum = Phaser.Math.Between( 0, 1 );
        let enemy;

        // Uses a random number to choose an enemy type to spawn
        if ( randNum == 0 ) {
          enemy = new CatDemon( this, x, y );
        } else {
          enemy = new LizardDemon( this, x, y );
        }
        this.enemyGroup.add( enemy );
      }
    } );
  }

  /**
   * Creates the boss in the passed boss room.
   */
  createBoss( room ) {
    this.boss = new CrazyBirdLady( this, this.map.tileToWorldX( ( room.left + room.right + 1 ) / 2 ), this.map.tileToWorldY( room.top + 2 ) );
  }

  /**
   * Creates colliders.
   * 
   * Most colliders are created in the constructors of individual game objects,
   * but most colliders created in this function are between groups of objects.
   * Both a collider and an overlapper are created for some intersections to detect
   * when there is both a collision from the outside and inside of the object.
   */
  createColliders() {
    // Laser x enemies/boss
    this.physics.add.collider( this.laserHitboxGroup, this.enemyHitboxGroup, ( laser, enemy ) => {
      laser.parent.collide();
      enemy.parent.hurt( this.player.damage, laser.parent.direction );
      this.scene.get( 'audio' ).randomHurt();
    } );
    this.physics.add.overlap( this.laserHitboxGroup, this.enemyHitboxGroup, ( laser, enemy ) => {
      laser.parent.collide();
      enemy.parent.hurt( this.player.damage, laser.parent.direction );
      this.scene.get( 'audio' ).randomHurt();
    } );
    this.physics.add.collider( this.laserHitboxGroup, [ this.boss.hitbox, this.boss.hitbox2 ], ( laser, boss ) => {
      laser.parent.collide();
      boss.parent.hurt( this.player.damage, laser.parent.direction );
      this.scene.get( 'audio' ).randomHurt();
    } );
    this.physics.add.overlap( this.laserHitboxGroup, [ this.boss.hitbox, this.boss.hitbox2 ], ( laser, boss ) => {
      laser.parent.collide();
      boss.parent.hurt( this.player.damage, laser.parent.direction );
      this.scene.get( 'audio' ).randomHurt();
    } );

    // Player x tiles
    this.physics.add.collider( this.player, this.objectLayer );
    this.physics.add.collider( this.player, this.groundLayer );
  }

  /**
   * Decreases score by a specific number every second.
   * 
   * Timer is paused at certain times, like when the game
   * is paused. Score cannot decrease further when at 0.
   */
  createScoreTimer() {
    this.scoreDecreaseTimer = this.time.addEvent( {
      delay: 1000,
      callback: () => {
        if ( this.playerDead ) {
          return;
        }
        if ( this.score >= this.scoreDecrement ) {
          this.score = this.score - this.scoreDecrement;
        } else if ( this.score > 0 ) {
          this.score = 0;
        }
      },
      loop: true,
    } );
  }

  /**
   * Creates an emitter that is used by enemies when they die to add to the player's score.
   * 
   * Calls addToScore(), passing the number that will be added.
   */
  createScoreEmitter() {
    this.scoreEmitter = new Phaser.Events.EventEmitter();
    this.scoreEmitter.on( "addScore", ( points ) => this.addToScore( points ) );
  }

  /**
   * Adds or subtracts a number from the player's score.
   * 
   * Called when an enemy dies. Prevents score from going
   * below 0 or going above 999 999.
   */
  addToScore( points ) {
    this.kills++;
    this.score += points;
    if ( this.score > 999999 ) {
      this.score = 999999;
    } else if ( this.score < 0 ) {
      this.score = 0;
    }
  }

  /**
   * Creates an emitter that detects when the player dies.
   * 
   * The player emits a signal when they die, which is detected and 
   * prompts the game to end.
   */
  createPlayerDeathEmitter() {
    this.deathEmitter = new Phaser.Events.EventEmitter();
    this.deathEmitter.once( "playerDead", () => this.gameEnd() );
  }

  /**
   * Ends the game.
   * 
   * Writes the players score to the JSON file and
   * launches the game over screen after a delay.
   */
  gameEnd() {
    this.scoreDecreaseTimer.paused = true;
    this.totalTimeTimer.paused = true;

    this.scene.get( "audio" ).stop();
    this.scene.stop( "overlay" );
    var isNewBest = this.writeScore(); // True if new highscore

    this.time.delayedCall( this.delayBeforeEnd, () => {
      this.tweens.killAll();
      this.scene.launch( "gameOver", {
        score: this.score,
        time: this.formattedTime,
        kills: this.kills,
        newBest: isNewBest // Passes whether or not player has a new highscore to determine if 'New best!' should be displayed
      } );
    } );
  }

  /**
   * Writes run details to JSON file.
   * 
   * Gets the run time and score, puts them into a record, and decides
   * if the player has a new highscore. If it is the new highscore,
   * the JSON file is rewritten with the new run details. Returns
   * true if the player has a new highscore, and false if not.
   */
  writeScore() {
    this.formattedTime = this.getTimeTaken(); // Formats the run time and returns it as a string

    var scoreDetails = {
      score: this.score,
      time: this.formattedTime,
    };
    var isNewBest = false;
    if ( this.score > this.jsonDetails.bestRun.score ) { // Replaces the bestRun record with the new details if the player has a new best
      this.jsonDetails.bestRun = scoreDetails;
      isNewBest = true;

    }

    fs.writeFile( "info.json", JSON.stringify( this.jsonDetails, null, 2 ), function ( err ) {
      if ( err ) throw err;
    } );

    return isNewBest;
  }

  /**
   * Converts the run time into hh:mm:ss format.
   * 
   * Returns the formatted time to writeScore() to be 
   * displayed on the game over screen or potentially
   * be written to the JSON file if the score is a new
   * best.
   */
  getTimeTaken() {
    var milliseconds = this.timeElapsed;

    var seconds = milliseconds / 1000; // 1000ms in a second

    var hours = Math.floor( seconds / 3600 ); // 3600 seconds in an hour
    seconds = seconds % 3600; // Remaining seconds after multiples of 3600 are removed

    var minutes = Math.floor( seconds / 60 ); // 60 seconds in a minute
    seconds = Math.floor( seconds % 60 ); // Remaining seconds after multiples of 60 are removed

    // Adds a '0' in front of a time value if it has 1 digit
    if ( hours < 10 ) {
      hours = "0" + hours;
    }
    if ( minutes < 10 ) {
      minutes = "0" + minutes;
    }
    if ( seconds < 10 ) {
      seconds = "0" + seconds;
    }

    return hours + ":" + minutes + ":" + seconds;
  }

  /**
   * Pauses the game if 'escape' is pressed.
   * 
   * Pauses the game and overlay scene, then runs
   * the pause scene over the game. Also pauses
   * the two timers.
   */
  gamePause() {
    if ( Phaser.Input.Keyboard.JustDown( this.keyEscape ) ) {
      this.totalTimeTimer.paused = true;
      this.scoreDecreaseTimer.paused = true;
      this.input.keyboard.resetKeys();
      this.scene.get( 'audio' ).playSFX( 'select_confirm' );
      this.scene.pause();
      this.scene.pause( "overlay" );
      this.scene.launch( 'pause' );
    }
  }

  /**
   * Creates the dungeon.
   * 
   * Generates a dungeon using given config then
   * creates it using a tilesheet. 
   */
  createDungeon() {
    // Destroys the dungeon if there is already one existing
    if ( this.dungeon !== undefined ) {
      this.destroyDungeon();
    }

    /* -------------------------- Generation of dungeon ------------------------- */

    // Creates a dungeon using configuration
    this.dungeon = new Dungeon( {
      // The dungeon's grid dimensions
      width: 100,
      height: 100,
      doorPadding: 2, // Minimum tiles between the door and side of the room
      rooms: {
        // Range for room width
        width: {
          min: 15,
          max: 31,
          onlyOdd: true,
        },
        // Range for room height
        height: {
          min: 15,
          max: 31,
          onlyOdd: true,
        },
        maxArea: 300, // Max area of a room
        maxRooms: 10, // Max number of rooms that can be created
      },
    } );

    // Create a blank tilemap that will become the dungeon
    this.map = this.make.tilemap( {
      tileWidth: 32,
      tileHeight: 32,
      width: this.dungeon.width,
      height: this.dungeon.height,
    } );

    // Load tile set
    this.tileset = this.map.addTilesetImage( "tilesheet32", null, 32, 32 );

    /* --------------------------------- Layers --------------------------------- */

    // Floor and blank layer
    this.groundLayer = this.map.createBlankDynamicLayer( "ground", this.tileset );

    // Wall layers
    this.roomTopWallLayer = this.map.createBlankDynamicLayer( "roomTopWall", this.tileset );
    this.roomBottomWallLayer = this.map.createBlankDynamicLayer( "roomBottomWall", this.tileset ).setDepth( 10000 ); // Bottom wall appears above all characters
    this.roomSideWallLayer = this.map.createBlankDynamicLayer( "roomSideWall", this.tileset );

    // Object layer
    this.objectLayer = this.map.createBlankDynamicLayer( "object", this.tileset );

    // Room corners
    this.topCornerLayer = this.map.createBlankDynamicLayer( "topCorner", this.tileset ).setDepth( 10001 ); // Top corner of rooms appear above bottom wall of other rooms
    this.bottomCornerLayer = this.map.createBlankDynamicLayer( "bottomCorner", this.tileset );

    // Top layer of every wall tile
    this.topWallTopLayer = this.map.createBlankDynamicLayer( "topWallTop", this.tileset ).setDepth( 10001 ); // Top wall layer appears above bottom wall but this causes it to appear above characters too, no workaround
    this.bottomWallTopLayer = this.map.createBlankDynamicLayer( "bottomWallTop", this.tileset ).setDepth( 10000 ); // Same depth as bottom wall

    /* -------------------------- Building the dungeon -------------------------- */

    // Fills the entire map with blank tiles that the player collides with
    this.groundLayer.fill( tiles.blank );

    // Builds each room
    this.dungeon.rooms.forEach( ( room ) => {
      const {
        x,
        y,
        width,
        height,
        left,
        right,
        top,
        bottom
      } = room;
      const doors = room.getDoorLocations();

      // Fill the floor with mostly empty tiles but with the occasional decoration
      this.groundLayer.weightedRandomize( x + 1, y + 1, width - 2, height - 1, tiles.floor );

      // Place the room corners tiles 
      this.bottomCornerLayer.putTileAt( tiles.wall.bottom_left, left, bottom );
      this.bottomCornerLayer.putTileAt( tiles.wall.bottom_right, right, bottom );
      this.topCornerLayer.putTileAt( tiles.wall.top_left, left, top - 1 );
      this.topCornerLayer.putTileAt( tiles.wall.top_right, right, top - 1 );

      // Fill the walls with tiles
      this.roomTopWallLayer.weightedRandomize( left + 1, top, width - 2, 1, tiles.wall.topBottom );
      this.roomBottomWallLayer.weightedRandomize( left + 1, bottom, width - 2, 1, tiles.wall.topBottom );
      this.roomSideWallLayer.weightedRandomize( left, top, 1, height - 1, tiles.wall.left );
      this.roomSideWallLayer.weightedRandomize( right, top, 1, height - 1, tiles.wall.right );

      // Places special door tiles around doors
      // Explanation for top is same for bottom, same goes for left and right
      doors.forEach( ( door ) => {
        if ( door.y == 0 ) { // Top
          // Places wall tile and top layer tile on the left side of the doorway
          this.roomTopWallLayer.putTileAt( tiles.door.bottom_right, left + door.x - 1, top + door.y );
          this.topWallTopLayer.putTileAt( tiles.door.wallTop_bottom_right, left + door.x - 1, top + door.y - 1 );

          // Places floor tile inside the doorway to let the player walk through
          this.groundLayer.weightedRandomize( left + door.x, top + door.y, 1, 1, tiles.floor );

          // Removes the wall tile that would be blocking the doorway
          this.roomTopWallLayer.removeTileAt( left + door.x, top + door.y );

          // Places wall tile and top layer tile on the right side of the doorway
          this.roomTopWallLayer.putTileAt( tiles.door.bottom_left, left + door.x + 1, top + door.y );
          this.topWallTopLayer.putTileAt( tiles.door.wallTop_bottom_left, left + door.x + 1, top + door.y - 1 );

        } else if ( door.y == height - 1 ) { // Bottom
          this.roomBottomWallLayer.putTileAt( tiles.door.top_right, left + door.x - 1, top + door.y );
          this.bottomWallTopLayer.putTileAt( tiles.door.wallTop_top_right, left + door.x - 1, top + door.y - 1 );
          this.groundLayer.weightedRandomize( left + door.x, top + door.y, 1, 1, tiles.floor );
          this.roomBottomWallLayer.removeTileAt( left + door.x, top + door.y );
          this.roomBottomWallLayer.putTileAt( tiles.door.top_left, left + door.x + 1, top + door.y );
          this.bottomWallTopLayer.putTileAt( tiles.door.wallTop_top_left, left + door.x + 1, top + door.y - 1 );
        } else if ( door.x == 0 ) { // Left
          // Places wall tile and top layer tile at the top of the doorway
          this.roomSideWallLayer.putTileAt( tiles.door.bottom_right, left + door.x, top + door.y - 1 );
          this.topWallTopLayer.putTileAt( tiles.door.wallTop_bottom_right, left + door.x, top + door.y - 2 );

          // Places 2 floor tiles inside the doorway one below the other to let the player walk through
          this.groundLayer.weightedRandomize( left + door.x, top + door.y, 1, 2, tiles.floor );

          // Removes wall tile that would be blocking the doorway
          this.roomSideWallLayer.removeTileAt( left + door.x, top + door.y );

          // Places wall tile and top layer tile at the bottom of the doorway
          this.roomBottomWallLayer.putTileAt( tiles.door.top_right, left + door.x, top + door.y + 1 );
          this.bottomWallTopLayer.putTileAt( tiles.door.wallTop_top_right, left + door.x, top + door.y );

        } else if ( door.x == width - 1 ) { // Right
          this.roomSideWallLayer.putTileAt( tiles.door.bottom_left, left + door.x, top + door.y - 1 );
          this.topWallTopLayer.putTileAt( tiles.door.wallTop_bottom_left, left + door.x, top + door.y - 2 );
          this.groundLayer.weightedRandomize( left + door.x, top + door.y, 1, 2, tiles.floor );
          this.roomSideWallLayer.removeTileAt( left + door.x, top + door.y );
          this.roomBottomWallLayer.putTileAt( tiles.door.top_left, left + door.x, top + door.y + 1 );
          this.bottomWallTopLayer.putTileAt( tiles.door.wallTop_top_left, left + door.x, top + door.y );
        }
      } );

      // Adds top layer of bricks to each wall tile 
      const type1Array = [ 41, 58, 65, 74 ];
      const type2Array = [ 49, 50, 57, 66, 73 ];
      var skipTile = false;

      this.roomTopWallLayer.forEachTile( ( tile ) => { // Top
        // Prevents placement of top layer on doorway
        doors.forEach( ( door ) => {
          if ( left + door.x == tile.x && top + door.y == tile.y ) {
            skipTile = true;
          }

          // Checks which array the tile index is part of and adds the tile
          if ( type1Array.includes( tile.index ) && !skipTile ) {
            this.topWallTopLayer.putTileAt( tiles.wallTop.type1, tile.x, tile.y - 1 );
          } else if ( type2Array.includes( tile.index ) && !skipTile ) {
            this.topWallTopLayer.putTileAt( tiles.wallTop.type2, tile.x, tile.y - 1 );
          }

          skipTile = false;
        } );
      }, this, left + 1, top, width - 2, 1 );

      this.roomBottomWallLayer.forEachTile( ( tile ) => { // Bottom
        // Prevents placement of top layer on doorway
        doors.forEach( ( door ) => {
          if ( left + door.x == tile.x && top + door.y == tile.y ) {
            skipTile = true;
          }

          // Checks which array the tile index is part of and adds the tile
          if ( type1Array.includes( tile.index ) && !skipTile ) {
            this.bottomWallTopLayer.putTileAt( tiles.wallTop.type1, tile.x, tile.y - 1 );
          } else if ( type2Array.includes( tile.index ) && !skipTile ) {
            this.bottomWallTopLayer.putTileAt( tiles.wallTop.type2, tile.x, tile.y - 1 );
          }

          skipTile = false;
        } );
      }, this, left + 1, bottom, width - 2, 1 );
    } );

    /* ------------------------------- Collisions ------------------------------- */

    // Sets collisions for blank tiles
    this.groundLayer.setCollision( tiles.blank ); // Collisions with perimeter of rooms
  }

  /**
   * Destroys the dungeon.
   * 
   * Called by createDungeon() if a dungeon already exists.
   * Destroys map and layers to create a new level cleanly.
   */
  destroyDungeon() {
    this.map.destroy();
    this.groundLayer.destroy();
    this.roomTopWallLayer.destroy();
    this.roomBottomWallLayer.destroy();
    this.roomSideWallLayer.destroy();
    this.objectLayer.destroy();
    this.topCornerLayer.destroy();
    this.bottomCornerLayer.destroy();
    this.topWallTopLayer.destroy();
    this.bottomWallTopLayer.destroy();
  }
}