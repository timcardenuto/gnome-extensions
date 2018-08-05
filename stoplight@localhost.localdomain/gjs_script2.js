#!/usr/bin/gjs

imports.gi.versions.Gtk = '3.0';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

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
		this._starthour3.connect ("value-changed", this._showLast.bind(this));
		this._hourLabel3 = new Gtk.Label ({ label: "hours", margin_left: 5, margin_right: 5});

		this._startmin3 = Gtk.SpinButton.new_with_range (0, 59, 1);
		this._startmin3.connect ("value-changed", this._showLast.bind(this));
		this._minLabel3 = new Gtk.Label ({ label: "mins", margin_left: 5, margin_right: 5});

		this._startsec3 = Gtk.SpinButton.new_with_range (0, 59, 1);
		this._startsec3.connect ("value-changed", this._showLast.bind(this));
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

	_showLast() {
		this._starthour3.get_value() this._startmin3.get_value() this._startsec3.get_value()
		log("whatever");
	}
};


function main() {
	let app = new viewLogPopUp();
	return app.application.run(ARGV);
}

main();
