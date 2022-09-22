const {
  app,
  BrowserWindow
} = require( 'electron' );
const electronLocalshortcut = require( 'electron-localshortcut' );

/**
 * Creates the program window.
 */
function createWindow() {
  // Create the browser window
  const win = new BrowserWindow( {
    width: 768,
    height: 432,
    fullscreenable: true,
    useContentSize: true,
    show: false, // Initially invisible while window loads
    icon: "assets/images/favicon.ico",
    webPreferences: {
      nodeIntegration: true
    }
  } );

  // Load index.html
  win.loadFile( 'index.html' );

  // Remove toolbar 
  win.removeMenu();
  win.openDevTools();

  // Toggles fullscreen when 'F' is pressed
  electronLocalshortcut.register( win, 'F', () => {
    if ( win.isFullScreen() ) {
      win.setFullScreen( false );
    } else {
      win.setFullScreen( true );
    }
  } );

  // Prevents resizing
  win.on( 'will-resize', ( e ) => {
    e.preventDefault();
  } );

  // Shows window once everything has loaded, prevents visible loading
  win.once( 'ready-to-show', () => {
    win.show();
  } );
}

// Creates window when electron is ready
app.whenReady().then( createWindow );

// Quit everything when window is closed
app.on( 'window-all-closed', () => {
  app.quit();
} );