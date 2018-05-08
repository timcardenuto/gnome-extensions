#!/usr/bin/env python

import socket
import sys
import os
import json
import time

server_address = '/tmp/unix_socket'

# Make sure the socket does not already exist
try:
	os.unlink(server_address)
except OSError:
	if os.path.exists(server_address):
		raise

# Create a Unix domain socket
sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

# Bind the socket to the port
print >>sys.stderr, 'starting up on %s' % server_address
sock.bind(server_address)

# Listen for incoming connections
sock.listen(1)

while True:
	# Wait for a connection
	print >>sys.stderr, 'waiting for a connection'
	connection, client_address = sock.accept()
	try:
		print >>sys.stderr, 'connection from', client_address

		while True:
			try:
				#data = '{"eventId":"0","description":"words go here","metadata":"blahblah"}'
				data = json.dumps({'eventId':'0', 'description':'no energy', 'metadata':'nosignal'})
				print 'sending data: ' + str(json.loads(data))
				connection.sendall(data)
				time.sleep(5)

				data = json.dumps({'eventId':'1', 'description':'energy up', 'metadata':'good1'})
				print 'sending data: ' + str(json.loads(data))
				connection.sendall(data)
				time.sleep(2)

				data = json.dumps({'eventId':'3', 'description':'energy up', 'metadata':'bad1'})
				print 'sending data: ' + str(json.loads(data))
				connection.sendall(data)
				time.sleep(2)

				data = json.dumps({'eventId':'3', 'description':'energy up', 'metadata':'bad2'})
				print 'sending data: ' + str(json.loads(data))
				connection.sendall(data)
				time.sleep(2)

				data = json.dumps({'eventId':'2', 'description':'energy down', 'metadata':'good1'})
				print 'sending data: ' + str(json.loads(data))
				connection.sendall(data)
				time.sleep(2)

				data = json.dumps({'eventId':'4', 'description':'energy down', 'metadata':'bad2'})
				print 'sending data: ' + str(json.loads(data))
				connection.sendall(data)
				time.sleep(2)

			except socket.error:
				print "socket.error"
				break

			break		# TODO remove this break when ready to test continous data
			time.sleep(1)
	finally:
		# Clean up the connection
		connection.close()
