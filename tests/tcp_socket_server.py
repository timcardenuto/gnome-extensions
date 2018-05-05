#!/usr/bin/env python

# Echo server program
import socket
import time

HOST = '127.0.0.1'        # Symbolic name meaning the local host
PORT = 50000              # Arbitrary non-privileged port
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((HOST, PORT))
while True:
	s.listen(1)
	conn, addr = s.accept()
	print 'Accepted connection from ', addr
	while True:
		try:
			packet = "hello world " + str(time.time()) + "\n"
			print "sending " + str(packet)
			conn.sendall(packet)
		except socket.error:
			print "socket.error"
			break
		break		# TODO remove this break when ready to test continous data
		time.sleep(5)
	#while True:
	#    data = conn.recv(1024)
	#    if not data: break
	#    print data
	print 'Closing connection from ', addr
	conn.close()
