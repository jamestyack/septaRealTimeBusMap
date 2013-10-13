Open Data Webapps
============

This project contains a number of separate prototypes and visualizations related to Open Data sources and 'Civic Hacking'.  Back end code is very lightweight Ruby (Sinatra) and mainly consists of REST endpoints to support the Ajax calls from the client-side web pages.

* restWebService.rb is the Ruby Sinatra file containing REST endpoints and redirections to erb templates containing the HTML views for the web pages

Philly Bus Explorer
---------------

A prototype that shows bus routes that pass through given neighborhood of Philadelphia along with locations of buses.

/views/philly_bus_explorer.erb (and releated JS). 

View it online at [Heroku](http://tyack.herokuapp.com/phillybusexplorer)

Nottingham Traffic Accidents
------------------------

A visualisation of Nottingham (UK) Traffic Accident data.  Blog entry explaining data etc. at [tyack.net](http://tyack.net/wp/2013/09/16/mapping-open-traffic-accident-data/)

/views/nottm_traffic_accidents.erb (and related JS - see HTML inside ERB for paths etc)

View it online at [Heroku](http://tyack.herokuapp.com/nottinghamtrafficaccidents)

Unlock Philadelphia
----------------

An interactive web application that was prototyped at Apps For Philly Transit Hackathon.  The aim is provide better information about accessibility. E.g visualize accessibility of stations and services around the stations. The hope is that the app can be developed and extended significantly to help people of Philadelphia.

/views/unlock_philadelphia.erb (and related JS - see HTML inside ERB for paths etc)

View it online at [Heroku](http://tyack.herokuapp.com/unlockphiladelphia)
