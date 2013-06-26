#!/bin/bash
echo running js to populate collections for app
mongo localhost:27017/explorer seed_collections.js
echo complete

