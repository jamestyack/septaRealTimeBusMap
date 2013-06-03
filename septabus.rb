#!/usr/bin/env ruby
require 'sinatra'
require 'rubygems'
require 'rest_client'
require 'json'

configure do
  
end
 
get '/septa/bus/:id' do
	RestClient.get "http://www3.septa.org/transitview/bus_route_data/#{params[:id]}"
end

get '/septa/buses' do
	
	buses = { "route" => "12", "lat" => "39.944649", "long" => "-75.180679" }
	content_type "application/json"
	"#{buses.to_json}"
end