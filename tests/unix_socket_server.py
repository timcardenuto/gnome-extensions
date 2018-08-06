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
#sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)

# Bind the socket to the port
print >>sys.stderr, 'starting up on %s' % server_address
sock.bind(server_address)

# Listen for incoming connections
sock.listen(1)

# data msg's to play out
#'''
datas = [json.dumps({'localTime':time.time(), 'eventId':'0', 'description':'no energy', 'metadata':'nosignal'}),
			json.dumps({'localTime':time.time(), 'eventId':'1', 'description':'energy up', 'metadata':'good1'}),
			json.dumps({'localTime':time.time(), 'eventId':'3', 'description':'energy up', 'metadata':'bad1'}),
			json.dumps({'localTime':time.time(), 'eventId':'3', 'description':'energy up', 'metadata':'bad2'}),
			json.dumps({'localTime':time.time(), 'eventId':'2', 'description':'energy down', 'metadata':'good1'}),
			json.dumps({'localTime':time.time(), 'eventId':'4', 'description':'energy down', 'metadata':'bad2'})]

''' # newline version
datas = [(json.dumps({'eventId':'0', 'description':'no energy', 'metadata':'nosignal'})+'\n'),
			(json.dumps({'eventId':'1', 'description':'energy up', 'metadata':'good1'})+'\n'),
			(json.dumps({'eventId':'3', 'description':'energy up', 'metadata':'bad1'})+'\n'),
			(json.dumps({'eventId':'3', 'description':'energy up', 'metadata':'bad2'})+'\n'),
			(json.dumps({'eventId':'2', 'description':'energy down', 'metadata':'good1'})+'\n'),
			(json.dumps({'eventId':'4', 'description':'energy down', 'metadata':'bad2'})+'\n')]
'''

while True:
	# Wait for a connection
	print >>sys.stderr, 'waiting for a connection'
	connection, client_address = sock.accept()
	#my_writer_obj = connection.makefile("rwb", bufsize=0)
	print >>sys.stderr, 'connection from', client_address

	for data in datas:
		try:
			connection.send(data)
			#my_writer_obj.write(data)
			#my_writer_obj.flush()
			print 'sending data: ' + str(json.loads(data))

		except socket.error:
			print "socket.error"
			break

		time.sleep(2)

	# Clean up the connection
	#my_writer_obj.close()
	connection.close()
