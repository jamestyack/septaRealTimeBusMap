#!/usr/bin/env ruby
require 'sinatra'
require 'rubygems'
require 'rest_client'
require 'json'
require 'set'
require 'mongo'
require 'uri'

include Mongo

$stdout.sync = true

configure do  
  db = URI.parse(ENV['MONGOHQ_URL'])
  conn = MongoClient.new(db.host, db.port)
  db_name = db.path.gsub(/^\//, '')
  set :mongo_connection, conn
  set :mongo_db, conn.db(db_name)
  puts "dbconnection successful to #{ENV['MONGOHQ_URL']}"
end

get '/septa/route/locations/:id' do
	RestClient.get "http://www3.septa.org/transitview/bus_route_data/#{params[:id]}"
end

get '/septa/zone/:zone/routes' do
  zonesCol = settings.mongo_db['Zones']
  result = zonesCol.find_one({:_id => params[:zone]})
  puts "thanks mongo for telling us that zone #{params[:zone]} haz routes #{result["buses"]}"
  return result["buses"].to_json
end

get '/' do
	redirect '/index.html'
end



