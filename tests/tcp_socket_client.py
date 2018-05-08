#!/usr/bin/env python

import socket
import time

HOST = '127.0.0.1'    # The remote host
PORT = 50000              # The same port as used by the server
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))

while True:
	try:
		data = s.recv(1024)
		print "data " + str(data)
		#time.sleep(1)
	except socket.error:
		s.close()
		print "socket.error"
