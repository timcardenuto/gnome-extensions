#!/usr/bin/gjs

imports.gi.versions.Gtk = '3.0';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Pango = imports.gi.Pango;
//const Util = imports.misc.util;

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
		this._startLabel1 = new Gtk.Label ({ label: "Start", margin_right: 5 });

		// Create the first spinbutton using a function
		this._starthour1 = Gtk.SpinButton.new_with_range (0, 23, 1);
		this._hourLabel1 = new Gtk.Label ({ label: "hours", margin_left: 5, margin_right: 5});

		// Create the second spinbutton
		this._startmin1 = Gtk.SpinButton.new_with_range (0, 59, 1);
		this._minLabel1 = new Gtk.Label ({ label: "mins", margin_left: 5, margin_right: 5});

		// Create the third spinbutton
		this._startsec1 = Gtk.SpinButton.new_with_range (0, 59, 1);
		this._secLabel1 = new Gtk.Label ({ label: "secs", margin_left: 5});

		// Create a grid to put the spinbuttons and their labels in
		this._spinGrid = new Gtk.Grid ({
		    halign: Gtk.Align.CENTER,
		    valign: Gtk.Align.CENTER,
		    margin_bottom: 10 });

		// Attach everything to the grid
		this._spinGrid.attach (this._startLabel1, 0, 0, 1, 1);
		this._spinGrid.attach (this._starthour1, 1, 0, 1, 1);
		this._spinGrid.attach (this._hourLabel1, 2, 0, 1, 1);
		this._spinGrid.attach (this._startmin1, 3, 0, 1, 1);
		this._spinGrid.attach (this._minLabel1, 4, 0, 1, 1);
		this._spinGrid.attach (this._startsec1, 5, 0, 1, 1);
		this._spinGrid.attach (this._secLabel1, 6, 0, 1, 1);


		// Build End Time line -------------------------------------------------------------
		this._startLabel2 = new Gtk.Label ({ label: " End ", margin_right: 5});

		this._starthour2 = Gtk.SpinButton.new_with_range (0, 23, 1);
		this._hourLabel2 = new Gtk.Label ({ label: "hours", margin_left: 5, margin_right: 5});

		this._startmin2 = Gtk.SpinButton.new_with_range (0, 59, 1);
		this._minLabel2 = new Gtk.Label ({ label: "mins", margin_left: 5, margin_right: 5});

		this._startsec2 = Gtk.SpinButton.new_with_range (0, 59, 1);
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
		this._hourLabel3 = new Gtk.Label ({ label: "hours", margin_left: 5, margin_right: 5});

		this._startmin3 = Gtk.SpinButton.new_with_range (0, 59, 1);
		this._minLabel3 = new Gtk.Label ({ label: "mins", margin_left: 5, margin_right: 5});

		this._startsec3 = Gtk.SpinButton.new_with_range (0, 59, 1);
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
		this._dorange.connect ("clicked", this._showRange.bind(this));
		this._mainGrid.attach (this._dorange, 0, 0, 1, 2);
		this._mainGrid.attach (this._spinGrid, 1, 0, 1, 1);
		this._mainGrid.attach (this._spinGrid2, 1, 1, 1, 1);

		// option 2
		this._dolast = new Gtk.Button ({label: "Show Last", margin_top: 10, margin_right: 5});
		this._dolast.connect ("clicked", this._showLast.bind(this));
		this._mainGrid.attach (this._dolast, 0, 2, 1, 1);
		this._mainGrid.attach (this._spinGrid3, 1, 2, 1, 1);

		// option 3
		this._doall = new Gtk.Button ({label: "Show Everything", margin_top: 10, margin_bottom: 10});
		this._doall.connect ("clicked", this._showEverything.bind(this));
		this._mainGrid.attach (this._doall, 0, 3, 2, 1);


		// the scrolledwindow
		this._scrolledWindow = new Gtk.ScrolledWindow();
		this._scrolledWindow.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC);
		this._scrolledWindow.set_min_content_height(200);
		this._scrolledWindow.set_hexpand_set(true)
		this._scrolledWindow.set_hexpand(true)
		// add the scrolledwindow to the main grid
		this._mainGrid.attach (this._scrolledWindow, 0, 4, 2, 1);
		this._mainGrid.set_hexpand_set(true) 
		this._mainGrid.set_hexpand(true)

		// add main grid to master window and display it
		this._window.add (this._mainGrid);
		this._window.set_hexpand_set(true) 
		this._window.set_hexpand(true)
		this._window.show_all();
	}

	_showEverything() {
		this._addLogList();
		log("[INFO]  Showing all logs");
	}

	_showLast() {
		var rightnow = new Date();
		rightnow.setHours(rightnow.getHours() - this._starthour3.get_value());
		rightnow.setMinutes(rightnow.getMinutes() - this._startmin3.get_value());
		rightnow.setSeconds(rightnow.getSeconds() - this._startsec3.get_value());
		log("[INFO]  Showing logs since "+rightnow.toString());
	}

	_showRange() {
		var d1 = new Date();
		d1.setHours(this._starthour1.get_value(), this._startmin1.get_value(), this._startsec1.get_value());
		var d2 = new Date();
		d2.setHours(this._starthour2.get_value(), this._startmin2.get_value(), this._startsec2.get_value());
		log("[INFO]  Showing logs between "+d1.toString()+" and "+d2.toString());
	}

	_addLogList() {
		// Create the underlying liststore
		this._listStore = new Gtk.ListStore();
		this._listStore.set_column_types([
			GObject.TYPE_STRING,
			GObject.TYPE_STRING,
			GObject.TYPE_STRING,
			GObject.TYPE_STRING]);

		// read logs from file
		var fh = Gio.file_new_for_path('/tmp/stoplight.log')
		var fsize = fh.query_info("standard::size", Gio.FileQueryInfoFlags.NONE, null).get_size();
		var fstream = fh.open_readwrite(null).get_input_stream();
		var bytes = fstream.read_bytes(fsize, null).get_data();
		fstream.close(null);
		var lines = bytes.toString().split(/\n/);
		var wrapped = "[" + lines.filter(Boolean).join(",") + "]";
		var alerts = JSON.parse(wrapped);

		// Put the data in the listStore
		for (let i = 0; i < alerts.length; i++ ) {
		    let alert = alerts[i];
		    this._listStore.set(this._listStore.append(), [0, 1, 2, 3], [alert.localTime, alert.eventId, alert.description, alert.metadata]);
		}

		// Create the treeview
		this._treeView = new Gtk.TreeView ({
		    expand: true,
		    model: this._listStore });

		// Create the columns
		let localTime = new Gtk.TreeViewColumn ({ title: "Local Time" });
		let eventId = new Gtk.TreeViewColumn ({ title: "Event ID" });
		let description = new Gtk.TreeViewColumn ({ title: "Description" });
		let metadata = new Gtk.TreeViewColumn ({ title: "Metadata" });

		// Create a cell renderer for when bold text is needed
		let bold = new Gtk.CellRendererText ({
		    weight: Pango.Weight.BOLD });

		// Create a cell renderer for normal text
		let normal = new Gtk.CellRendererText ();

		// Pack the cell renderers into the columns
		localTime.pack_start (bold, true);
		eventId.pack_start (normal, true);
		description.pack_start (normal, true);
		metadata.pack_start (normal, true);

		// Set each column to pull text from the TreeView's model
		localTime.add_attribute (bold, "text", 0);
		eventId.add_attribute (normal, "text", 1);
		description.add_attribute (normal, "text", 2);
		metadata.add_attribute (normal, "text", 3);

		// Insert the columns into the treeview
		this._treeView.insert_column (localTime, 0);
		this._treeView.insert_column (eventId, 1);
		this._treeView.insert_column (description, 2);
		this._treeView.insert_column (metadata, 3);

		// add the treeview to the scrolledwindow, and redraw
		this._scrolledWindow.add_with_viewport(this._treeView)
		this._window.show_all();
	}
};


function main() {
	let app = new viewLogPopUp();
	return app.application.run(ARGV);
}

main();
