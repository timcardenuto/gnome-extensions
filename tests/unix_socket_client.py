#!/usr/bin/env python

import socket
import sys

# Create a UDS socket
sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

# Connect the socket to the port where the server is listening
server_address = '/tmp/unix_socket'
print >>sys.stderr, 'connecting to %s' % server_address
try:
    sock.connect(server_address)
except socket.error, msg:
    print >>sys.stderr, msg
    sys.exit(1)

while True:
    try:
        data = sock.recv(1024)
        print 'received ' + str(data)

    except socket.error:
        print "socket.error"
        sock.close()
        break
