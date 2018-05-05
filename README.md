

### Fix gnome-shell-extensions-tool for CentOS 7

    sudo yum install python34 python34-pip python34-gobject
    sudo python3 -m pip install gi

    sudo gedit gnome-shell-extensions-tool
	  # change first line to
      #!/usr/bin/python3


### Generate your hello-world extension skeleton

    $ gnome-shell-extensions-tool --create-extension

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


This actually creates the skeleton project directly under `~/.local/share/gnome-shell/extensions`. You'll need to edit it there or copy somewhere and remember to copy back when you want to update the live version.


### Enable extension

    gsettings set org.gnome.shell enabled-extensions "['stoplight@localhost.localdomain']"

Press Alt-F2, and then enter 'r' to reload gnome extensions. You should now see some gears at the top right toolbar, if you click "Hello, world!" will pop up in the center of the screen. Everytime you make code changes you can copy the new files to `~/.local/share/gnome-shell/extensions` if they're not already there, and reload the extensions.


### Hack time
Best documentation I've found for the javascript API - http://devdocs.baznga.org/

Note that "Gjs" stands for Gnome JavaScript and are the required bindings for the base C libraries.

Find more examples of stuff
 * http://mathematicalcoffee.blogspot.com/2012/11/sending-notifications-in-gnome-shell.html
 * https://github.com/hackedbellini/Gnome-Shell-Notifications-Alert
 * https://www.abidibo.net/blog/2016/03/02/how-i-developed-my-first-gnome-shell-extension/
 * https://github.com/julio641742/gnome-shell-extension-reference/blob/master/tutorials/POPUPMENU-EXTENSION.md
