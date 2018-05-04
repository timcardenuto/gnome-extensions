
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

let text, button;

function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _showHello() {
    Main.notify('notification title', 'notification summary');    

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
    let icon = new St.Icon({ icon_name: 'red',
                             style_class: 'system-status-icon' });

    button.set_child(icon);
    // this function called when image clicked on
    //TODO change function to dropdown box that shows more info or something
    button.connect('button-press-event', _showHello);

    //TODO need to add event listener here that changes colors ...
    //TODO ... and also makes popup like the _showHello, but persists until user clicks OK
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
