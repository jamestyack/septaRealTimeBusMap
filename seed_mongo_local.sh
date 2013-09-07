#!/bin/bash
echo running js to populate collections for app
mongo localhost:27017/tyack seed_collections.js
echo complete

