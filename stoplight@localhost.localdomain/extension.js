const Main = imports.ui.main;
const Lang = imports.lang;
const St = imports.gi.St;               // create UI elements
const Clutter = imports.gi.Clutter;     // layout UI elements
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const Tweener = imports.ui.tweener;
const Soup = imports.gi.Soup  // REST and Websocket libraries
const Gio = imports.gi.Gio;   // sockets
const Gtk = imports.gi.Gtk;   // needed to add search path for icons/ folder
const MessageTray = imports.ui.messageTray;

var unixSocketAddress = '/tmp/unix_socket';
var tcpSocketAddress = '127.0.0.1';
var tcpSocketPort = 50000;
// Events: 0=No Signal, 1=Good Up, 2=Good Down, 3=Bad Up, 4=Bad Down
// States: 0=Not Sure (no signal), 1=Good, 2=Bad
var state = 0;
var goodcount = 0;
var badcount = 0;
var text = null;
var button;

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
		let greenIcon =  new St.Icon({ icon_name: 'greenIcon', style_class: 'system-status-icon'});
        let yellowIcon =  new St.Icon({ icon_name: 'yellowIcon', style_class: 'system-status-icon'});
        let redIcon =  new St.Icon({ icon_name: 'redIcon', style_class: 'system-status-icon'});

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

        // hide the green/red icons, start out yellow
        this.actor.get_first_child().get_child_at_index(0).hide() // greenIcon.svg
        this.actor.get_first_child().get_child_at_index(2).hide() // redIcon.svg

		// example of a menu expander, for adding sub-menus
		let inactiveMenu = new PopupMenu.PopupSubMenuMenuItem("Inactive");
		// use the CSS file to define styles
		inactiveMenu.menu.box.style_class = 'PopupSubMenuMenuItemStyle';

		// other standard menu items
		let connectionMenu = new PopupMenu.PopupSwitchMenuItem('Connection');

		// Assemble all menu items
		this.menu.addMenuItem(connectionMenu);
		this.menu.addMenuItem(inactiveMenu);
		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

		// with PopupSwitchMenuItem you can use the signal `toggled`
		connectionMenu.connect('toggled', Lang.bind(this, function(){
			connectUnixSocket();
		}));

		//with Popup*MenuItem you can use the signal `activate`, it is fired when the user clicks over a menu item
		//imagemenuitem1.connect('activate', Lang.bind(this, function(){
            // do other stuff here
		//}));

		// with 'open-state-changed' on a popupmenu we can know if the menu is being shown
		this.menu.connect('open-state-changed', Lang.bind(this, function(){
            // show submenu
			//inactiveMenu.setSubmenuShown(true);
		}));

	},

	//	destroy the button
	destroy: function() {
		this.parent();
	}
});

function hidePopUp() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function showPopUp() {
	Main.uiGroup.add_actor(text);
	text.opacity = 255;
	let monitor = Main.layoutManager.primaryMonitor;
	text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
	                monitor.y + Math.floor(monitor.height / 2 - text.height / 2));
	Tweener.addTween(text,
	               { opacity: 0,
	                 time: 2,
	                 transition: 'easeOutExpo',
	                 onComplete: hidePopUp });
}

// helper function to search for menu objects
function findMenuItem(label) {
	try {
		let items = button.menu._getMenuItems();
		for (var i=0; i<items.length; i++) {
			if (items[i].label.get_first_child().get_text() == label) { return items[i]; }
		}
	} catch(err) {
	  Main.notify('findMenuItem()', 'Error: ' + err);
	}
	return null;
}

// helper function to search for menu objects
function findSubMenuItem(label, sublabel) {
	try {
		let items = button.menu._getMenuItems();
		for (var i=0; i<items.length; i++) {
			if (items[i].label.get_first_child().get_text() == label) {
				let subitems = items[i].menu._getMenuItems();
				for (var j=0; j<subitems.length; j++) {
					if (subitems[j].label.get_first_child().get_text() == sublabel) { return subitems[j]; }
				}
			}
		}
	} catch(err) {
	  Main.notify('findSubMenuItem()', 'Error: ' + err);
	}
	return null;
}

// socket callback
function socketRead(gobject, async_res) {
	try {
		let [lineout, charlength, error] = gobject.read_line_finish(async_res);
		log("Raw line from socket: " + lineout);
		let newlineout = lineout.toString().replace(/}/gi, "}/");
		let splitlineout = newlineout.split('/');

		for (var i=0; i<(splitlineout.length-1); i++) {
			let msg = JSON.parse(splitlineout[i]);
			log("Parsing: " + splitlineout[i]);

			//if (msg.eventId == null || msg.metadata == null || msg.description == null) { break; }

			// add/remove menu items
			if (msg.eventId == "0") {
				// nothing special here

			// Good Up
			} else if (msg.eventId == "1") {
				goodcount = goodcount + 1;
				// add new menu item
				let menuitem = new PopupMenu.PopupImageMenuItem(msg.metadata, 'greenIcon');
				button.menu.addMenuItem(menuitem);
				// connect to a pop up that displays more details if you click the menuitem
				text = new St.Label({ style_class: 'helloworld-label', text: msg.description });
				menuitem.connect('activate', showPopUp);
				// delete from inactiveMenu if it's listed there
				let item = findSubMenuItem("Inactive",msg.metadata);
				if (item != null) { item.destroy(); }

			// Good Down
			} else if (msg.eventId == "2") {
				goodcount = goodcount - 1;
				// move notification to the storage bin
				let item = findMenuItem(msg.metadata);
				if (item != null) { item.destroy(); }
				let inactiveMenu = findMenuItem("Inactive");
				let menuitem = new PopupMenu.PopupImageMenuItem(msg.metadata, 'greenIcon');
				inactiveMenu.menu.addMenuItem(menuitem);

			// Bad Up
			} else if (msg.eventId == "3") {
				badcount = badcount + 1;
				let menuitem = new PopupMenu.PopupImageMenuItem(msg.metadata, 'redIcon');
				button.menu.addMenuItem(menuitem);
				let item = findSubMenuItem("Inactive",msg.metadata);
				if (item != null) { item.destroy(); }

			// Bad Down
			} else if (msg.eventId == "4") {
				badcount = badcount - 1;
				let item = findMenuItem(msg.metadata);
				if (item != null) { item.destroy(); }
				let inactiveMenu = findMenuItem("Inactive");
				let menuitem = new PopupMenu.PopupImageMenuItem(msg.metadata, 'redIcon');
				inactiveMenu.menu.addMenuItem(menuitem);
			} else {
				Main.notify('socketRead()', 'Error: ' + msg.eventId + ' is not a recognized eventId');
			}

			// update top level status symbol
			// NOTE the child index changes if you include or delete the icon as part of the button
			// TODO need a better way to index/search for children based on names or something
			if (badcount > 0) {
				state = 2;
				button.actor.get_first_child().get_child_at_index(0).hide() // greenIcon.svg
				button.actor.get_first_child().get_child_at_index(1).hide() // yellowIcon.svg
				button.actor.get_first_child().get_child_at_index(2).show() // redIcon.svg
				button.actor.get_first_child().get_child_at_index(3).set_text('Bad')
			} else if (goodcount > 0) {
				state = 1;
				button.actor.get_first_child().get_child_at_index(0).show() // greenIcon.svg
				button.actor.get_first_child().get_child_at_index(1).hide() // yellow.svg
				button.actor.get_first_child().get_child_at_index(2).hide() // redIcon.svg
				button.actor.get_first_child().get_child_at_index(3).set_text('Good')
			} else {
				state = 0;
				button.actor.get_first_child().get_child_at_index(0).hide() // greenIcon.svg
				button.actor.get_first_child().get_child_at_index(1).show() // yellowIcon.svg
				button.actor.get_first_child().get_child_at_index(2).hide() // redIcon.svg
				button.actor.get_first_child().get_child_at_index(3).set_text('No Signal')
			}

			// NOTE this works, but notify does not flush that frequently so you should only use it for *very* infrequent things
			Main.notify(msg.metadata, msg.description);
		}
	} catch(err) {
		Main.notify('socketRead()', 'Error: ' + err);
	}
}

// connect to [existing] Unix Socket
// NOTE this will fail with connection refused if there isn't a server listening
function connectUnixSocket() {
	try {
		let sockClient, sockAddr, sockConnection, output_reader;

		sockClient = new Gio.SocketClient();
		sockAddr = Gio.UnixSocketAddress.new(unixSocketAddress);
		sockConnection = sockClient.connect(sockAddr, null);

		let connectionMenu = findMenuItem('Connection');
		if (connectionMenu != null) { connectionMenu.setToggleState(1); }
		Main.notify('UnixSocket', 'connected');

		// read server socket
		output_reader = new Gio.DataInputStream({ base_stream: sockConnection.get_input_stream() });
		output_reader.read_line_async(0, null, socketRead);

	} catch(err) {
		Main.notify('UnixSocket', 'Error: ' + err);
		let connectionMenu = findMenuItem('Connection');
		if (connectionMenu != null) { connectionMenu.setToggleState(0); }
		button.actor.get_first_child().get_child_at_index(3).set_text('No Connection')
	}
}

// connect to [existing] TCP socket
// NOTE this will fail with connection refused if there isn't a server listening
function connectTCPSocket() {
  try {
    let sockClient, output_reader;

    sockClient = new Gio.SocketClient();
    sockConnection = sockClient.connect_to_host(tcpSocketAddress, tcpSocketPort, null);
    Main.notify('TCPSocket', 'connected');

    // read server socket
    output_reader = new Gio.DataInputStream({ base_stream: sockConnection.get_input_stream() });
    output_reader.read_line_async(0, null, socketRead);

  } catch(err) {
    Main.notify('TCPSocket', 'Error: ' + err);
	let connectionMenu = findMenuItem('Connection');
	if (connectionMenu != null) { connectionMenu.setToggleState(0); }
	button.actor.get_first_child().get_child_at_index(3).set_text('No Connection')
  }
}


// Gnome Extension entry point, constructor()
function init(extensionMeta) {
	log('#####################################################################')
    // adds my 'icons/' folder to the search path
    let theme = Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
}

// documentation says "don't do anything in init(), do it in enable()"
function enable() {
    // instantiate button with dropdown menu
    button = new PopupMenuExample;
    Main.panel.addToStatusArea('PopupMenuExample', button, 0, 'right');

    connectUnixSocket();
    //connectTCPSocket();
	//connectWebSocket();
	//connectREST();
}

// the corallary to enable() anything that was created should be destroyed here
function disable() {
    button.destroy();
}


//--REST/Websocket stuff-------------------------------------------------------
/*
function connectREST() {
/*  // GET example
    let params = {
       amount: '1000',
       sourceCurrency: 'CHF',
       targetCurrency: 'EUR'
    };
    let message = Soup.form_request_new_from_hash('GET', 'http://localhost:8000/geolocation', params);
    message.request_headers.append("Content-type", "application/json");
*//*
    let message = Soup.Message.new('GET', 'http://localhost:8000/geolocation')

	// execute the request and define the callback
	let _httpSession = new Soup.Session();
	_httpSession.queue_message(message, Lang.bind(this,
		function (_httpSession, message) {
			if (message.status_code !== 200) {
				// change icon color
				let icon = new St.Icon({ icon_name: 'redIcon',
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

function connectWebSocket() {

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
*//*
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
*/
