#!/bin/bash
HOST="dharma.mongohq.com:10052"
DB="app16234547"
USER="james"
echo running js to populate collections for app
echo Enter password for $USER at $HOST/$DB
read -s PASSWORD
mongo --username $USER --password $PASSWORD $HOST/$DB seed_collections.js
echo complete