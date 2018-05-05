const Main = imports.ui.main;
const Lang = imports.lang;
const St = imports.gi.St;               // create UI elements
const Clutter = imports.gi.Clutter;     // layout UI elements

const Tweener = imports.ui.tweener;
const Soup = imports.gi.Soup	// REST and Websocket libraries
const Gio = imports.gi.Gio;   // sockets
const Gtk = imports.gi.Gtk;   // needed to add search path for icons/ folder
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;


// Class for the button/menu object
// More examples at https://github.com/julio641742/gnome-shell-extension-reference/blob/master/tutorials/POPUPMENU-EXTENSION.md
const PopupMenuExample = new Lang.Class({
	Name: 'PopupMenuExample',	// Class Name
	Extends: PanelMenu.Button,	// Parent Class

	// Constructor
	_init: function() {
		this.parent(1, 'PopupMenuExample', false);

		// creates a box layout area for top toolbar
		let box = new St.BoxLayout();

        // default icons in `/usr/share/icons/theme-being-used`, others in the local icons/ path added in init()
		let greenIcon =  new St.Icon({ icon_name: 'green', style_class: 'system-status-icon'});
        let yellowIcon =  new St.Icon({ icon_name: 'yellow', style_class: 'system-status-icon'});
        let redIcon =  new St.Icon({ icon_name: 'red', style_class: 'system-status-icon'});

		// visible label expanded and center aligned in the y-axis
		let toplabel = new St.Label({ text: 'Status',
			y_expand: true,
			y_align: Clutter.ActorAlign.CENTER });

		// add the icon, label, etc. to the box object
        // NOTE instead of 'changing' icons later, you just add all the icons
        // you'll need and you can selectively hide/show them later. There may
        // be a way to add/remove as well...
		box.add(greenIcon);
        box.add(yellowIcon);
        box.add(redIcon);
		box.add(toplabel);
		//box.add(PopupMenu.arrowIcon(St.Side.BOTTOM));

		// add the box to the button
		this.actor.add_child(box);

        // hide the yellow/red icons, start out green
        this.actor.get_first_child().get_child_at_index(1).hide() // yellow.svg
        this.actor.get_first_child().get_child_at_index(2).hide() // red.svg

		// example of a menu expander, for adding sub-menus
		let popupMenuExpander = new PopupMenu.PopupSubMenuMenuItem('PopupSubMenuMenuItem');
		let submenu = new PopupMenu.PopupMenuItem('PopupMenuItem');

		// add the submenu to the menu expander
		popupMenuExpander.menu.addMenuItem(submenu);

		// use the CSS file to define styles
		popupMenuExpander.menu.box.style_class = 'PopupSubMenuMenuItemStyle';

		// other standard menu items
		let menuitem = new PopupMenu.PopupMenuItem('PopupMenuItem');
		let switchmenuitem = new PopupMenu.PopupSwitchMenuItem('PopupSwitchMenuItem');
		let imagemenuitem1 = new PopupMenu.PopupImageMenuItem('PopupImageMenuItem1', 'green');
        let imagemenuitem2 = new PopupMenu.PopupImageMenuItem('PopupImageMenuItem2', 'yellow');
        let imagemenuitem3 = new PopupMenu.PopupImageMenuItem('PopupImageMenuItem3', 'red');

		// Assemble all menu items
		this.menu.addMenuItem(popupMenuExpander);
		this.menu.addMenuItem(menuitem);
		this.menu.addMenuItem(switchmenuitem);
		this.menu.addMenuItem(imagemenuitem1);
        this.menu.addMenuItem(imagemenuitem2);
        this.menu.addMenuItem(imagemenuitem3);


		// with PopupSwitchMenuItem you can use the signal `toggled` and do interesting stuff with it
		switchmenuitem.connect('toggled', Lang.bind(this, function(object, value){
			// change the text content of the label
			if(value) {
				label.set_text('On');
			} else {
				label.set_text('Off');
			}
            // do other stuff here
		}));

		//with Popup*MenuItem you can use the signal `activate`, it is fired when the user clicks over a menu item
		imagemenuitem1.connect('activate', Lang.bind(this, function(){
            // do other stuff here
		}));

		// with 'open-state-changed' on a popupmenu we can know if the menu is being shown
		this.menu.connect('open-state-changed', Lang.bind(this, function(){
            // show submenu
			//popupMenuExpander.setSubmenuShown(true);
            // do other stuff here
		}));

	},

	//	destroy the button
	destroy: function() {
		this.parent();
	}
});


/*
// Simple Button Example
function hidePopUp() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function showPopUp() {
	// pop-up at top of screen
  Main.notify('notification title', 'notification summary');

  // change icon color
  let icon = new St.Icon({ icon_name: 'yellow',
                           style_class: 'system-status-icon' });
  basicbutton.set_child(icon);

  // pop-up in middle of screen
  if (!text) {
      text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
      Main.uiGroup.add_actor(text);
  }

  text.opacity = 255;

  let monitor = Main.layoutManager.primaryMonitor;

  text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
                    monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

  Tweener.addTween(text,
                   { opacity: 0,
                     time: 2,
                     transition: 'easeOutQuad',
                     onComplete: hidePopUp });
}
*/


// Gnome Extension entry point, constructor()
function init(extensionMeta) {
    // adds my 'icons/' folder to the search path ------------------
    let theme = Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
    //--------------------------------------------------------------

/*
    // Simple Button Example
    // creates a button object (actually inserted/drawn in enable())
    basicbutton = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });

    // create icon object using the desired icon file name (must be part of search path)
    let icon = new St.Icon({ icon_name: 'green',
                             style_class: 'system-status-icon' });
    // add icon to button
    basicbutton.set_child(icon);
    // register a callback for the event when the button is clicked
    basicbutton.connect('button-press-event', showPopUp);
*/
}

// documentation says "don't do anything in init(), do it in enable()"
function enable() {
    // instantiate button with dropdown menu
    button = new PopupMenuExample;
    Main.panel.addToStatusArea('PopupMenuExample', button, 0, 'right');

    // simple button whose image can change dynamically
    //Main.panel._rightBox.insert_child_at_index(basicbutton, 0);

    //TODO need to add event listener here that changes colors ...
    //TODO ... and also makes popup like the _showHello, but persists until user clicks OK
    //testREST();
    //testWebSocket();
    testUnixSocket();
    testTCPSocket();
}

// the corallary to enable() anything that was created should be destroyed here
function disable() {
    button.destroy();
    //Main.panel._rightBox.remove_child(basicbutton);
}











// callback
function socketRead(gobject, async_res) {
  try {
    let [lineout, charlength, error] = gobject.read_line_finish(async_res);
    // TODO data check to make sure this is valid and not random stuff

    // NOTE this works, but notify does not flush that frequently so you should only use it for *very* infrequent things
    Main.notify('Socket', 'data: ' + lineout);

    // can add/modify stuff on button based on received data
    // change top menu quick look text/icon
    // NOTE the child index changes if you include or delete the icon as part of the button
    // TODO need a better way to index/search for children based on names or something
    button.actor.get_first_child().get_child_at_index(0).hide() // green.svg
    button.actor.get_first_child().get_child_at_index(1).show() // yellow.svg
    button.actor.get_first_child().get_child_at_index(3).set_text('Warning')
    // modify/add new sub-menu items
    let imagemenuitem4 = new PopupMenu.PopupImageMenuItem('PopupImageMenuItem4', 'red');
    button.menu.addMenuItem(imagemenuitem4);

  } catch(err) {
    Main.notify('socketRead', 'Error: ' + err);
  }
}


// TODO implement some light polling for server when not connected, a try again
function testTCPSocket() {
  try {
    let sockClient, output_reader, receivedline;

    // connect to [existing] TCP socket
    // NOTE this will fail with connection refused if there isn't a server listening
    sockClient = new Gio.SocketClient();
    //sockAddr = Gio.InetSocketAddress.new_from_string('127.0.0.1',12345);
    //sockConnection = sockClient.connect(sockAddr, null);
    sockConnection = sockClient.connect_to_host('127.0.0.1', 50000, null);
    Main.notify('TCPSocket', 'connected');

    // read server socket
    output_reader = new Gio.DataInputStream({ base_stream: sockConnection.get_input_stream() });
    output_reader.read_line_async(0, null, socketRead);

  } catch(err) {
    Main.notify('TCPSocket', 'Error: ' + err);
  }
}


function testUnixSocket() {
  try {
    let sockClient, output_reader, receivedline;

    // connect to Unix Socket
    sockClient = new Gio.SocketClient();
    sockAddr = Gio.UnixSocketAddress.new('/tmp/unix_socket');
    sockConnection = sockClient.connect(sockAddr, null);
    Main.notify('UnixSocket', 'connected');

    // read server socket
    output_reader = new Gio.DataInputStream({ base_stream: sockConnection.get_input_stream() });
    output_reader.read_line_async(0, null, socketRead);

  } catch(err) {
    Main.notify('UnixSocket', 'Error: ' + err);
  }
}





//--REST/Websocket stuff---------------------------------------------

function testREST() {
/*  // GET example
    let params = {
       amount: '1000',
       sourceCurrency: 'CHF',
       targetCurrency: 'EUR'
    };
    let message = Soup.form_request_new_from_hash('GET', 'http://localhost:8000/geolocation', params);
    message.request_headers.append("Content-type", "application/json");
*/
    let message = Soup.Message.new('GET', 'http://localhost:8000/geolocation')

	// execute the request and define the callback
	let _httpSession = new Soup.Session();
	_httpSession.queue_message(message, Lang.bind(this,
		function (_httpSession, message) {
			if (message.status_code !== 200) {
				// change icon color
				let icon = new St.Icon({ icon_name: 'red',
								  style_class: 'system-status-icon' });
				basicbutton.set_child(icon);
				return;
			}
			Main.notify('Websocket', 'response: ' + message.response_body.data);
			let json = JSON.parse(message.response_body.data);
			// do something with the data, check for stuff

		})
	);
}

function testWebSocket() {

    let message = Soup.Message.new('GET', 'ws://localhost:9000/ws')

	let _httpSession = new Soup.Session();
	_httpSession.httpAliases = ["ws"];
	_httpSession.websocket_connect_async(message, null, null, null, Lang.bind(this,
		function (session, res) {
			this._websocketConnection = session.websocket_connect_finish(res);

			this._websocketConnection.connect("message", Lang.bind(this, function(connection, type, message) {
			    var data = JSON.parse(message.get_data());
				Main.notify('Websocket', 'response: ' + message.get_data());
				// do something with the data, check for stuff
			}));
 		}
	));


	// close the socket
	this._websocketConnection.close(Soup.WebsocketCloseCode.NORMAL, "");
    Main.notify('Websocket', 'Closed');
/*
    websocket = Soup.Websocket.Connection.new("ws://localhost:9000/ws");
    websocket.onopen = function(evt) { onOpen(evt) };			// callbacks?
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
*/
}

function onOpen(evt) {
    Main.notify('Websocket', 'Connected');
    doSend("WebSocket rocks");
}

function onClose(evt) {
    Main.notify('Websocket', 'Closed');
}

function onMessage(evt) {
    var msg = evt.data;
    Main.notify('Websocket', msg);
}

function onError(evt) {
    var err = evt.data;
    Main.notify('Websocket', err);
}
