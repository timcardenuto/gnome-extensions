# Gnome Shell Extensions


### Fix gnome-shell-extension-tool for CentOS 7
This is only needed to run the script that generates a extension skeleton, you may not need to do this to simply install/run the extension.

    sudo yum install python34 python34-pip python34-gobject
    sudo python3 -m pip install gi

    sudo gedit gnome-shell-extension-tool
	  # change first line to
      #!/usr/bin/python3


### Generate a hello-world extension skeleton
Running the script asks you some questions before generating the project code.

    $ gnome-shell-extension-tool --create-extension

	Name should be a very short (ideally descriptive) string.
	Examples are: "Click To Focus",  "Adblock", "Shell Window Shrinker".

	Name: stoplight

	Description is a single-sentence explanation of what your extension does.
	Examples are: "Make windows visible on click", "Block advertisement popups"
		          "Animate windows shrinking on minimize"

	Description: "Red, yellow, green."

	Uuid is a globally-unique identifier for your extension.
	This should be in the format of an email address (foo.bar@extensions.example.com), but
	need not be an actual email address, though it's a good idea to base the uuid on your
	email address.  For example, if your email address is janedoe@example.com, you might
	use an extension title clicktofocus@janedoe.example.com.
	Uuid [stoplight@localhost.localdomain]:

This actually creates the skeleton project directly under `~/.local/share/gnome-shell/extensions`. To enable the extension you have to run the following:

    gsettings set org.gnome.shell enabled-extensions "['stoplight@localhost.localdomain']"

Then press Alt-F2, and then enter 'r' to reload gnome extensions. Now you should see a new icon in the top right toolbar that you can click to get a 'Hello World!' popup textbox. You can edit the code under `~/.local/share/gnome-shell/extensions` in real time, but may have to reload the extension for certain changes to take effect.


### Hack time
Note that the default documentation for Gnome is for C/C++, what you probably want to search for is "Gjs" which stands for Gnome JavaScript and are the required bindings for the base libraries. Best documentation I've found for this API is here - http://devdocs.baznga.org/. More examples of stuff:
 * http://mathematicalcoffee.blogspot.com/2012/11/sending-notifications-in-gnome-shell.html
 * https://github.com/hackedbellini/Gnome-Shell-Notifications-Alert
 * https://www.abidibo.net/blog/2016/03/02/how-i-developed-my-first-gnome-shell-extension/
 * https://github.com/julio641742/gnome-shell-extension-reference/blob/master/tutorials/POPUPMENU-EXTENSION.md

Best way to debug is by using the logging function like this `log('I'm a log message');` to print output for the extensions that can be seen by running `journalctl -f` in a terminal.


### Install/enable extension from source
For system wide installation do the following:

    sudo cp -r stoplight@localhost.localdomain/ /usr/share/gnome-shell/extensions  
    sudo cp -r stoplight@localhost.localdomain/icons /usr/share/icons/gnome/16x16/stoplight
    gsettings set org.gnome.shell enabled-extensions "['stoplight@localhost.localdomain']"

You should now see a new icon and dropdown menu in the top right toolbar. You can edit the code under `/usr/share/gnome-shell/extensions` in real time, and reload the extension if needed by pressing Alt-F2 and entering 'r'.


### Install from RPM release
This has nothing to do with Gnome Extensions, I just package them as an RPM so to install a release you simply `sudo yum install <gnome_extension_name>.rpm`. This will auto-enable the extension, but you will need to reload the Gnome shell since there doesn't appear to be a way to do this during package installation. You can reboot, log out/in, or press Alt-F2 and enter 'r'.

To rebuild the RPM from source:

    cp stoplight-0.1.tar.gz ~/rpmbuild/SOURCES/
    cp stoplight.spec ~/rpmbuild/SPECS/
    rpmbuild -ba ~/rpmbuild/SPECS/stoplight.spec
    sudo yum install ~/rpmbuild/RPMS/x86_64/stoplight-0.1-1.el7.local.x86_64.rpm
    
