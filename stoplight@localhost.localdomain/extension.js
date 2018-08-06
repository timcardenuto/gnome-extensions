const Main = imports.ui.main;
const Lang = imports.lang;
const St = imports.gi.St;               // create UI elements
const Clutter = imports.gi.Clutter;     // layout UI elements
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const Gio = imports.gi.Gio;   // sockets
const Gtk = imports.gi.Gtk;   // needed to add search path for icons/ folder
const Tweener = imports.ui.tweener;
const Soup = imports.gi.Soup  // REST and Websocket libraries

const Util = imports.misc.util;		// launch applications?
const Mainloop = imports.mainloop;	// sleep?
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


var unixSocketAddress = '/tmp/unix_socket';
var tcpSocketAddress = '127.0.0.1';
var tcpSocketPort = 50000;
var output_reader;

// Events: 0=No Signal, 1=Good Up, 2=Good Down, 3=Bad Up, 4=Bad Down
// States: 0=Not Sure (no signal), 1=Good, 2=Bad
var state = 0;
var goodcount = 0;
var badcount = 0;
var text = null;
var button;
var data = [];

var timeoutCheckConnectionState = undefined;
var timeoutIntervalSeconds = 20;
var goodConnection = false
var firstfail = true
var veryfirstfail = true
var notifyOn = true;
let child = null;


// Class for the button/menu object
// More examples at https://github.com/julio641742/gnome-shell-extension-reference/blob/master/tutorials/POPUPMENU-EXTENSION.md
const StopLight = new Lang.Class({
	Name: 'StopLight',		// Class Name
	Extends: PanelMenu.Button,	// Parent Class

	// Constructor
	_init: function() {
		this.parent(1, 'StopLight', false);

		// creates a box layout area for top toolbar
		var box = new St.BoxLayout();

		// default icons in `/usr/share/icons/theme-being-used`, others in the local icons/ path added in init()
		var greenIcon =  new St.Icon({ icon_name: 'greenIcon', style_class: 'system-status-icon'});
		var yellowIcon =  new St.Icon({ icon_name: 'yellowIcon', style_class: 'system-status-icon'});
		var redIcon =  new St.Icon({ icon_name: 'redIcon', style_class: 'system-status-icon'});

		// visible label expanded and center aligned in the y-axis
		var toplabel = new St.Label({ text: 'Status',
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

		// for things like turning off notifications, managing connections
		var controlsMenu = new PopupMenu.PopupSubMenuMenuItem('Controls');
		var connectionSwitch = new PopupMenu.PopupSwitchMenuItem('Connection');
		var notifySwitch = new PopupMenu.PopupSwitchMenuItem('Notifications',1);
		controlsMenu.menu.addMenuItem(connectionSwitch);
		controlsMenu.menu.addMenuItem(notifySwitch);

		var inactiveMenu = new PopupMenu.PopupSubMenuMenuItem('Inactive');
		// use the CSS file to define styles
		inactiveMenu.menu.box.style_class = 'PopupSubMenuMenuItemStyle';

		// for triggering a popup display of all past received data
		var viewLogButton = new PopupMenu.PopupMenuItem('Log Search');

		// for triggering a popup display of stats
		//var viewLogButton = new PopupMenu.PopupMenuItem('Send To Chat');

		// Assemble all menu items
		this.menu.addMenuItem(controlsMenu);
		this.menu.addMenuItem(inactiveMenu);
		this.menu.addMenuItem(viewLogButton);
		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

		// with PopupSwitchMenuItem's you can use the signal `toggled`
		connectionSwitch.connect('toggled', Lang.bind(this, function(){
			connectUnixSocket();
		}));

		notifySwitch.connect('toggled', Lang.bind(this, function(){
			if (notifyOn) {
				notifyOn = false;
			} else {
				notifyOn = true;
			}
		}));

		// Launch viewer for log file when user clicks the 'Generate Report' button
		viewLogButton.connect('activate', Lang.bind(this, function(){
			showPopUp();
			//var app = new viewLogPopUp();
			//app.application.run("");
			//Util.spawn(['gedit','/tmp/stoplight.log']);
			
		}));

		// with 'open-state-changed' on a popupmenu we can know if the menu is being shown
		this.menu.connect('open-state-changed', Lang.bind(this, function(){
			// show submenu
			//inactiveMenu.setSubmenuShown(true);
		}));
	},

	// destroy the button
	destroy: function() {
		this.parent();
	}
});


function hidePopUp() {
	Main.uiGroup.remove_actor(text);
	text = null;
}

function showPopUp() {
	// don't launch more than 1 window
	if(!child) {
		log("[INFO]  Attempting to launch child subprocess...");
		child = Gio.Subprocess.new([Me.imports.searchPath + '/gjs_script2.js'], Gio.SubprocessFlags.INHERIT_FDS);
		child.wait_async(null, function(source, result) {
			source.wait_finish(result);
			log("[INFO]  Exiting child subprocess");
			child = null;
		});
		log("[INFO]  Launched child subprocess");
	}
}

// helper function to search for menu objects
function findMenuItem(label) {
	try {
		var items = button.menu._getMenuItems();
		for (var i=0; i<items.length; i++) {
			if (items[i].label.get_first_child().get_text() == label) { return items[i]; }
		}
	} catch(err) {
		if (notifyOn) { Main.notify('findMenuItem()', 'Error: ' + err); }
	}
	return null;
}

// helper function to search for menu objects
function findSubMenuItem(label, sublabel) {
	try {
		var items = button.menu._getMenuItems();
		for (var i=0; i<items.length; i++) {
			if (items[i].label.get_first_child().get_text() == label) {
				var subitems = items[i].menu._getMenuItems();
				for (var j=0; j<subitems.length; j++) {
					if (subitems[j].label.get_first_child().get_text() == sublabel) { return subitems[j]; }
				}
			}
		}
	} catch(err) {
		if (notifyOn) { Main.notify('findSubMenuItem()', 'Error: ' + err); }
	}
	return null;
}


function parseMessage(msg) {
	try {
		// add/remove menu items
		if (msg.eventId == "0") {
			// nothing special here

		// Good Up
		} else if (msg.eventId == "1") {
			goodcount = goodcount + 1;
			// add new menu item
			var menuitem = new PopupMenu.PopupImageMenuItem(msg.metadata, 'greenIcon');
			button.menu.addMenuItem(menuitem);
			// connect to a pop up that displays more details if you click the menuitem
			text = new St.Label({ style_class: 'helloworld-label', text: msg.description });
			menuitem.connect('activate', showPopUp);
			// delete from inactiveMenu if it's listed there
			var item = findSubMenuItem('Inactive',msg.metadata);
			if (item != null) { item.destroy(); }

		// Good Down
		} else if (msg.eventId == "2") {
			goodcount = goodcount - 1;
			// move notification to the storage bin
			var item = findMenuItem(msg.metadata);
			if (item != null) { item.destroy(); }
			var inactiveMenu = findMenuItem('Inactive');
			var menuitem = new PopupMenu.PopupImageMenuItem(msg.metadata, 'greenIcon');
			inactiveMenu.menu.addMenuItem(menuitem);

		// Bad Up
		} else if (msg.eventId == "3") {
			badcount = badcount + 1;
			var menuitem = new PopupMenu.PopupImageMenuItem(msg.metadata, 'redIcon');
			button.menu.addMenuItem(menuitem);
			var item = findSubMenuItem('Inactive',msg.metadata);
			if (item != null) { item.destroy(); }

		// Bad Down
		} else if (msg.eventId == "4") {
			badcount = badcount - 1;
			var item = findMenuItem(msg.metadata);
			if (item != null) { item.destroy(); }
			var inactiveMenu = findMenuItem('Inactive');
			var menuitem = new PopupMenu.PopupImageMenuItem(msg.metadata, 'redIcon');
			inactiveMenu.menu.addMenuItem(menuitem);
		} else {
			if (notifyOn) { Main.notify('socketReadCallback()', 'Error: ' + msg.eventId + ' is not a recognized eventId'); }
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
		if (notifyOn) { Main.notify(msg.metadata, msg.description); }

	} catch(err) {
		if (notifyOn) { Main.notify('parseMessage()', 'Error: ' + err); }
		log("parseMessage() Error: " + err);
	}
}





function reconnect() {
	// If this function is called while there's already a timer, then just reset the timer, don't keep adding timers
	if (timeoutCheckConnectionState) {
		log("[INFO]  Resetting connection timer");
		Mainloop.source_remove(timeoutCheckConnectionState);
		timeoutCheckConnectionState = undefined;
	}

	// Add callback function to Mainloop timer call
	// NOTE: the wait period happens *first* and then the function is called
	// NOTE: this is a non-blocking call, so stuff you put after it will happen before the stuff inside the function (which waits for the timeout first)
	timeoutCheckConnectionState = Mainloop.timeout_add_seconds(timeoutIntervalSeconds, Lang.bind(this, function() {
		log("[INFO]  Attempting re-connection... ");	// #1 - after timeout, print this
		connectUnixSocket();							// #2 - try this, error's out
		// If you remove the state change line below and return true, this will loop forever between failures. Or use the socketError conditions to drive a single reconnect attempt every time, which re-creates the timer
		//timeoutCheckConnectionState = undefined;
		if (goodConnection) {	// this cancels (exits) the timeout loop once we have a good connection again
			log("[INFO]  Successful, closing re-connection timer");
			return false;
		} else {				// otherwise just keep trying
			log("[INFO]  Failed connection attempt");
			return true;
		}
	}));

	log("[INFO]  Mainloop timer ID: "+timeoutCheckConnectionState)
}


// helper function to handle socket issues
function handleSocketError(func, err) {
	goodConnection = false;

	// update toggle button
	var connectionSwitch = findSubMenuItem('Controls','Connection');
	if (connectionSwitch != null) { connectionSwitch.setToggleState(0); }
	button.actor.get_first_child().get_child_at_index(3).set_text('No Connection')
	log("[ERROR]  "+func+" Error: "+err);

	// if this is the first failure since a successful connection, send popup notify and start reconnection loop
	if (firstfail) {
		firstfail = false;
		if (notifyOn) { Main.notify(func, 'Error: ' + err); }
		reconnect();
	}
}


// socket callback
// NOTE be careful with sockets! I've crashed Gnome a bunch of times trying to
//      figure out how to use get read_upto_async() right.
function socketReadCallback(gobject, async_res) {
	//log('>socketReadCallback()');
	try {

		var [str, len] = gobject.read_upto_finish(async_res);
		//log("Raw socket return: " + str);
		if (str == null) { throw "socket read returned null"; }

		// have to add the delimiter back that we use to parse socket data
		var jsonStr = str+'}';
		//log("Parsing: "+jsonStr);
		var jsonMsg = JSON.parse(jsonStr);

		// write messages to log file
		var fh = Gio.file_new_for_path('/tmp/stoplight.log')
		var fstream = fh.append_to(Gio.FileCreateFlags.NONE, null);
		fstream.write(JSON.stringify(jsonMsg)+"\n", null);

		// now that we finally have the data! this function does logic for UI
		parseMessage(jsonMsg);

		// NOTE Remove stop char from socket buffer, documentation isn't clear about
		// this, but you HAVE to read this out everytime to keep calling the socket
		var stopChar = output_reader.read_byte(null);
		//log("Stop byte: " + stopChar);

		// call socket read for next message
		output_reader.read_upto_async('}',1, 0, null, socketReadCallback);

	} catch(err) {
		handleSocketError('socketReadCallback()',err);
	}
}

// connect to [existing] Unix Socket
// NOTE this will fail with connection refused if there isn't a server listening
// NOTE this uses a TCP stream connection, doesn't seem support AF_UNIX, SOCK_DGRAM pair
function connectUnixSocket() {
	try {
		if (goodConnection) {
			log("[WARNING]  Attempted to reconnect while connection already good - ignoring");
			// fix toggle state back to good
			var connectionSwitch = findSubMenuItem('Controls','Connection');
			if (connectionSwitch != null) { connectionSwitch.setToggleState(1); }

		} else {
			var sockClient, sockAddr, sockConnection;
			sockClient = new Gio.SocketClient();
			sockAddr = Gio.UnixSocketAddress.new(unixSocketAddress);
			sockConnection = sockClient.connect(sockAddr, null);

			var connectionSwitch = findSubMenuItem('Controls','Connection');
			if (connectionSwitch != null) { connectionSwitch.setToggleState(1); }
			firstfail = true;
			goodConnection = true;
			log("[INFO]  Connected to Unix socket");
			if (notifyOn) { Main.notify('UnixSocket', 'connected'); }

			// read server socket, use '}' as delimiter
			output_reader = new Gio.DataInputStream({ base_stream: sockConnection.get_input_stream() });
			var cancellable = Gio.Cancellable.new();
			output_reader.read_upto_async('}',1, 0, cancellable, socketReadCallback);
		}
	} catch(err) {
		handleSocketError('connectUnixSocket()',err);
	}
}

// for a server implementation
// NOTE this isn't working, started on it but didn't finish
function connectUnixSocketServer() {
	try {
		var sock, newsock, sockAddr, sockConnection;

		sock = new Gio.Socket(1,1,6);
		log(sock.family);
		log(sock.type);
		log(sock.protocol);
		sockAddr = Gio.UnixSocketAddress.new(unixSocketAddress);

		sock.bind(sockAddr,true);
		sock.listen();
		newsock = sock.accept(null);

		var connectionSwitch = findSubMenuItem('Controls','Connection');
		if (connectionSwitch != null) { connectionSwitch.setToggleState(1); }
		if (notifyOn) { Main.notify('UnixSocket', 'connected'); }

		// read server socket
		output_reader = new Gio.DataInputStream({ base_stream: sockConnection.get_input_stream() });
		output_reader.read_line_async(0, null, socketReadCallback);

	} catch(err) {
		handleSocketError('connectUnixSocketClient()',err);
	}
}

// connect to [existing] TCP socket
// NOTE this will fail with connection refused if there isn't a server listening
function connectTCPSocket() {
	try {
		var sockClient, sockConnection;

		sockClient = new Gio.SocketClient();
		sockConnection = sockClient.connect_to_host(tcpSocketAddress, tcpSocketPort, null);
		if (notifyOn) { Main.notify('TCPSocket', 'connected'); }

		// read server socket
		output_reader = new Gio.DataInputStream({ base_stream: sockConnection.get_input_stream() });
		output_reader.read_line_async(0, null, socketReadCallback);

	} catch(err) {
		handleSocketError('connectTCPSocket()',err);
	}
}


// Gnome Extension entry point, constructor()
function init(extensionMeta) {
	log('stoplight - #########################################################')
	// adds my 'icons/' folder to the search path
	var theme = Gtk.IconTheme.get_default();
	theme.append_search_path(extensionMeta.path + "/icons");
}

// documentation says "don't do anything in init(), do it in enable()"
// NOTE this is executed every time you log in, after screen locks too
function enable() {
	log('stoplight - enable()')
	// instantiate button with dropdown menu
	button = new StopLight;
	Main.panel.addToStatusArea('stoplight', button, 0, 'right');

	connectUnixSocket();
	//connectTCPSocket();
	//connectWebSocket();
	//connectREST();
}

// the corallary to enable() anything that was created should be destroyed here
function disable() {
	if(child) {
		child.force_exit();
	}
	button.destroy();
}




class viewLogPopUp {

    // Create the application itself
    constructor() {
        this.application = new Gtk.Application({
            application_id: 'org.example.jsspinbutton'
        });

        // Connect 'activate' and 'startup' signals to the callback functions
        this.application.connect('activate', this._onActivate.bind(this));
        this.application.connect('startup', this._onStartup.bind(this));
    }

    // Callback function for 'activate' signal presents window when active
    _onActivate() {
        this._window.present();
    }

    // Callback function for 'startup' signal builds the UI
    _onStartup() {
        this._buildUI();
    }

    // Build the application's UI
    _buildUI() {

        // Create the application window
        this._window = new Gtk.ApplicationWindow({
            application: this.application,
            window_position: Gtk.WindowPosition.CENTER,
            border_width: 20,
            title: "Enter Log Search Range"});

		// Build Start Time line -------------------------------------------------------------
        this._startLabel = new Gtk.Label ({ label: "Start", margin_right: 5 });

        // Create the first spinbutton using a function
        this._starthour = Gtk.SpinButton.new_with_range (0, 23, 1);
        this._starthour.connect ("value-changed", this._newVal.bind(this));
        this._hourLabel = new Gtk.Label ({ label: "hours", margin_left: 5, margin_right: 5});

        // Create the second spinbutton
        this._startmin = Gtk.SpinButton.new_with_range (0, 59, 1);
        this._startmin.connect ("value-changed", this._newVal.bind(this));
        this._minLabel = new Gtk.Label ({ label: "mins", margin_left: 5, margin_right: 5});

        // Create the third spinbutton
        this._startsec = Gtk.SpinButton.new_with_range (0, 59, 1);
        this._startsec.connect ("value-changed", this._newVal.bind(this));
        this._secLabel = new Gtk.Label ({ label: "secs", margin_left: 5});

        // Create a grid to put the spinbuttons and their labels in
        this._spinGrid = new Gtk.Grid ({
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER,
            margin_bottom: 10 });

        // Attach everything to the grid
        this._spinGrid.attach (this._startLabel, 0, 0, 1, 1);
        this._spinGrid.attach (this._starthour, 1, 0, 1, 1);
        this._spinGrid.attach (this._hourLabel, 2, 0, 1, 1);
        this._spinGrid.attach (this._startmin, 3, 0, 1, 1);
        this._spinGrid.attach (this._minLabel, 4, 0, 1, 1);
        this._spinGrid.attach (this._startsec, 5, 0, 1, 1);
        this._spinGrid.attach (this._secLabel, 6, 0, 1, 1);


		// Build End Time line -------------------------------------------------------------
        this._startLabel2 = new Gtk.Label ({ label: " End ", margin_right: 5});

        this._starthour2 = Gtk.SpinButton.new_with_range (0, 23, 1);
        this._starthour2.connect ("value-changed", this._newVal.bind(this));
        this._hourLabel2 = new Gtk.Label ({ label: "hours", margin_left: 5, margin_right: 5});

        this._startmin2 = Gtk.SpinButton.new_with_range (0, 59, 1);
        this._startmin2.connect ("value-changed", this._newVal.bind(this));
        this._minLabel2 = new Gtk.Label ({ label: "mins", margin_left: 5, margin_right: 5});

        this._startsec2 = Gtk.SpinButton.new_with_range (0, 59, 1);
        this._startsec2.connect ("value-changed", this._newVal.bind(this));
        this._secLabel2 = new Gtk.Label ({ label: "secs", margin_left: 5});

        this._spinGrid2 = new Gtk.Grid ({
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER });

        this._spinGrid2.attach (this._startLabel2, 0, 0, 1, 1);
        this._spinGrid2.attach (this._starthour2, 1, 0, 1, 1);
        this._spinGrid2.attach (this._hourLabel2, 2, 0, 1, 1);
        this._spinGrid2.attach (this._startmin2, 3, 0, 1, 1);
        this._spinGrid2.attach (this._minLabel2, 4, 0, 1, 1);
        this._spinGrid2.attach (this._startsec2, 5, 0, 1, 1);
        this._spinGrid2.attach (this._secLabel2, 6, 0, 1, 1);

		// Last hours line -----------------------------------------------------------------------
		this._startLabel3 = new Gtk.Label ({ label: "Total", margin_right: 5});

        this._starthour3 = Gtk.SpinButton.new_with_range (0, 23, 1);
        this._starthour3.connect ("value-changed", this._newVal.bind(this));
        this._hourLabel3 = new Gtk.Label ({ label: "hours", margin_left: 5, margin_right: 5});

        this._startmin3 = Gtk.SpinButton.new_with_range (0, 59, 1);
        this._startmin3.connect ("value-changed", this._newVal.bind(this));
        this._minLabel3 = new Gtk.Label ({ label: "mins", margin_left: 5, margin_right: 5});

        this._startsec3 = Gtk.SpinButton.new_with_range (0, 59, 1);
        this._startsec3.connect ("value-changed", this._newVal.bind(this));
        this._secLabel3 = new Gtk.Label ({ label: "secs", margin_left: 5});

        this._spinGrid3 = new Gtk.Grid ({
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER,
			margin_top: 10});

        this._spinGrid3.attach (this._startLabel3, 0, 0, 1, 1);
        this._spinGrid3.attach (this._starthour3, 1, 0, 1, 1);
        this._spinGrid3.attach (this._hourLabel3, 2, 0, 1, 1);
        this._spinGrid3.attach (this._startmin3, 3, 0, 1, 1);
        this._spinGrid3.attach (this._minLabel3, 4, 0, 1, 1);
        this._spinGrid3.attach (this._startsec3, 5, 0, 1, 1);
        this._spinGrid3.attach (this._secLabel3, 6, 0, 1, 1);

		// Put it together -----------------------------------------------------------------------
        this._mainGrid = new Gtk.Grid ({
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER});

        // option 1
        this._dorange = new Gtk.Button ({label: "Show Range", margin_right: 5});
        this._mainGrid.attach (this._dorange, 0, 0, 1, 2);
        this._mainGrid.attach (this._spinGrid, 1, 0, 1, 1);
        this._mainGrid.attach (this._spinGrid2, 1, 1, 1, 1);
        //this._mainGrid.attach (this._optionGrid, 0, 2, 2, 1);

		// option 2
        this._dolast = new Gtk.Button ({label: "Show Last", margin_top: 10, margin_right: 5});
		this._dolastHours = Gtk.SpinButton.new_with_range (0, 23, 1);
        this._mainGrid.attach (this._dolast, 0, 2, 1, 1);
        this._mainGrid.attach (this._spinGrid3, 1, 2, 1, 1);


		// option 3
        this._doall = new Gtk.Button ({label: "Show Everything", margin_top: 10});
        this._mainGrid.attach (this._doall, 0, 3, 2, 1);

		// add to window and show
        this._window.add (this._mainGrid);
        this._window.show_all();
    }
	
	// recalculate time difference if needed...
	_newVal() {
        log("whatever");
    }
};


//-----------------------------------------------------------------------------
//--REST/Websocket stuff-------------------------------------------------------
//-----------------------------------------------------------------------------
/*
function connectREST() {
/*  // GET example
    var params = {
       amount: '1000',
       sourceCurrency: 'CHF',
       targetCurrency: 'EUR'
    };
    var message = Soup.form_request_new_from_hash('GET', 'http://localhost:8000/geolocation', params);
    message.request_headers.append("Content-type", "application/json");
*//*
    var message = Soup.Message.new('GET', 'http://localhost:8000/geolocation')

	// execute the request and define the callback
	var _httpSession = new Soup.Session();
	_httpSession.queue_message(message, Lang.bind(this,
		function (_httpSession, message) {
			if (message.status_code !== 200) {
				// change icon color
				var icon = new St.Icon({ icon_name: 'redIcon',
								  style_class: 'system-status-icon' });
				basicbutton.set_child(icon);
				return;
			}
			if (notifyOn) { Main.notify('Websocket', 'response: ' + message.response_body.data); }
			var json = JSON.parse(message.response_body.data);
			// do something with the data, check for stuff

		})
	);
}

function connectWebSocket() {

    var message = Soup.Message.new('GET', 'ws://localhost:9000/ws')

	var _httpSession = new Soup.Session();
	_httpSession.httpAliases = ["ws"];
	_httpSession.websocket_connect_async(message, null, null, null, Lang.bind(this,
		function (session, res) {
			this._websocketConnection = session.websocket_connect_finish(res);

			this._websocketConnection.connect("message", Lang.bind(this, function(connection, type, message) {
			    var data = JSON.parse(message.get_data());
				if (notifyOn) { Main.notify('Websocket', 'response: ' + message.get_data()); }
				// do something with the data, check for stuff
			}));
 		}
	));


	// close the socket
	this._websocketConnection.close(Soup.WebsocketCloseCode.NORMAL, "");
    if (notifyOn) { Main.notify('Websocket', 'Closed'); }
/*
    websocket = Soup.Websocket.Connection.new("ws://localhost:9000/ws");
    websocket.onopen = function(evt) { onOpen(evt) };			// callbacks?
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
*//*
}

function onOpen(evt) {
    if (notifyOn) { Main.notify('Websocket', 'Connected'); }
    doSend("WebSocket rocks");
}

function onClose(evt) {
    if (notifyOn) { Main.notify('Websocket', 'Closed'); }
}

function onMessage(evt) {
    var msg = evt.data;
    if (notifyOn) { Main.notify('Websocket', msg); }
}

function onError(evt) {
    var err = evt.data;
    if (notifyOn) { Main.notify('Websocket', err); }
}
*/
