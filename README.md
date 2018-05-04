

# Fix gnome-shell-extensions-tool for CentOS 7

    sudo yum install python34 python34-pip python34-gobject
    sudo python3 -m pip install gi
    
    sudo gedit gnome-shell-extensions-tool
	  # change first line to
      #!/usr/bin/python3


# Generate your hello-world extension skeleton 

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

# Enable extension

    gsettings set org.gnome.shell enabled-extensions "['stoplight@localhost.localdomain']"

Press Alt-F2, and then enter 'r' to reload gnome extensions. You should now see some gears at the top right toolbar, if you click "Hello, world!" will pop up in the center of the screen. 


# Hack time




