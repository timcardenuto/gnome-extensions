
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Lang = imports.lang;
const Soup = imports.gi.Soup	// REST and Websocket libraries

let text, button;

function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _showHello() {
	// pop-up at top of screen
    Main.notify('notification title', 'notification summary');    

	// change icon color
	let icon = new St.Icon({ icon_name: 'yellow',
                             style_class: 'system-status-icon' });
    button.set_child(icon);

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
                       onComplete: _hideHello });
    //websocket.close();
}

function init(extensionMeta) {
    // Added path to icons/ ------------------ 
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
    //----------------------------------------

    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
	
    // Edited icon to be green.svg on start
    let icon = new St.Icon({ icon_name: 'green',
                             style_class: 'system-status-icon' });

    button.set_child(icon);
    // this function called when image clicked on
    //TODO change function to dropdown box that shows more info or something
    button.connect('button-press-event', _showHello);

    //TODO need to add event listener here that changes colors ...
    //TODO ... and also makes popup like the _showHello, but persists until user clicks OK
	//testREST();
	testWebSocket();
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
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
				button.set_child(icon);
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


