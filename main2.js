const config = {
  type: Phaser.AUTO,
  width: 384,
  height: 216,
  parent: 'game',
  backgroundColor: '#ebe9e6',
  pixelArt: true, // Allows zooming without blurring
  roundPixels: true,
  antialias: false,
  antialiasGL: false,
  pack: { // Loads an image before the boot scene runs
    files: [ {
      type: 'image',
      key: 'rotate',
      url: 'assets/images/catDemon.png'
    } ]
  },
  scale: { // Retains 16:9 aspect ratio
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 0
      }
    }
  },
  plugins: { // Adds raycaster plugin that allows super laser to be shot by player, and enemy detection of player
    scene: [ {
      key: 'PhaserRaycaster',
      plugin: PhaserRaycaster,
      mapping: 'raycasterPlugin'
    } ]
  },
  scene: /*Bottom*/ [ Boot, Audio, Splash, GameMenu, Game, Overlay, BossIntro, Pause, GameOver, Options, ExitConfirm ] /*Top*/
};

var game = new Phaser.Game( config ); // The game
var fs = require( 'fs' ); // Allows writing to info.json