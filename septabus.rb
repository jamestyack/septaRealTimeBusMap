#!/usr/bin/env ruby
require 'sinatra'
require 'rubygems'
require 'rest_client'
require 'json'
require 'set'
require 'mongo'

include Mongo

$stdout.sync = true

configure do  
  conn = MongoClient.new("localhost", 27017)
  set :mongo_connection, conn
  set :mongo_db, conn.db('explorer')
end

get '/septa/route/locations/:id' do
	RestClient.get "http://www3.septa.org/transitview/bus_route_data/#{params[:id]}"
end

get '/septa/zone/:zone/routes' do
  zonesCol = settings.mongo_db['Zones']
  result = zonesCol.find_one({:_id => params[:zone]})
  puts "#{params[:zone]}: #{result["buses"]}"
  return result["buses"].to_json
end

get '/' do
	redirect '/index.html'
end



