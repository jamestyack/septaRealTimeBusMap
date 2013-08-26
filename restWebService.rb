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
  db_details = URI.parse(ENV['MONGOHQ_URL'])
  conn = MongoClient.new(db_details.host, db_details.port)
  db_name = db_details.path.gsub(/^\//, '')
  db = conn.db(db_name)
  db.authenticate(db_details.user, db_details.password) unless (db_details.user.nil? || db_details.user.nil?)
  set :mongo_db, db
  puts "dbconnection successful to #{ENV['MONGOHQ_URL']}"
end

get '/septa/route/locations/:id' do
	RestClient.get "http://www3.septa.org/transitview/bus_route_data/#{params[:id]}"
end

get '/septa/zone/:zone/routes' do
  content_type :json
  zonesCol = settings.mongo_db['Zones']
  result = zonesCol.find_one({:_id => params[:zone]})
  return "{'_id':'#{params[:zone]}', 'buses':[]}" if result.nil?
  puts "thanks mongo for telling us that zone #{params[:zone]} haz routes #{result["buses"]}"
  return result["buses"].to_json
end

get '/' do
	redirect '/phillybusexplorer'
end

get '/phillybusexplorer' do
  zonesCol = settings.mongo_db['Zones']
  zones = zonesCol.find(nil,{:fields => {"_id" => 1, "name" => 1}}).to_a
  puts(zones);
  erb :philly_bus_explorer, :locals => {:zones => zones}
end

get '/nottinghamtrafficaccidents' do
  erb :ncc_traffic_accidents
end


