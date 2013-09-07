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

# standard redirect to the bus explorer
get '/' do
  redirect '/phillybusexplorer'
end

# -------- Philly Bus Explorer ----------

get '/septa/route/locations/:id' do
	RestClient.get "http://www3.septa.org/transitview/bus_route_data/#{params[:id]}"
end

# REST service to get routes by zone
get '/septa/zone/:zone/routes' do
  content_type :json
  zonesCol = settings.mongo_db['Zones']
  result = zonesCol.find_one({:_id => params[:zone]})
  return "{'_id':'#{params[:zone]}', 'buses':[]}" if result.nil?
  puts "thanks mongo for telling us that zone #{params[:zone]} haz routes #{result["buses"]}"
  return result["buses"].to_json
end

# main page erb for the bus explorer
get '/phillybusexplorer' do
  zonesCol = settings.mongo_db['Zones']
  zones = zonesCol.find(nil,{:fields => {"_id" => 1, "name" => 1}}).to_a
  puts(zones);
  erb :philly_bus_explorer, :locals => {:zones => zones}
end

# -------- Nottingham Traffic Accidents --------------

# get accidents by year and severity
get '/nottinghamtraffic/accidents/:year/:severity' do
  content_type :json
  accidentCol = settings.mongo_db['Accident']
  result = accidentCol.find({:year => params[:year].to_i, :severity => params[:severity]})
  return "{'year':'#{params[:year]}', 'accidents':[]}" if result.nil?
  return result.to_a.to_json
end

# get accidents by year with pedestrianseverity
get '/nottinghamtraffic/accidents/:year/with/pedestrian/:severity' do
  content_type :json
  accidentCol = settings.mongo_db['Accident']
  result = accidentCol.find({:year => params[:year].to_i, :pedestrianSeverity => params[:severity]})
  return "{'year':'#{params[:year]}', 'accidents':[]}" if result.nil?
  return result.to_a.to_json
end

# get accidents by year with severity at time of day
get '/nottinghamtraffic/accidents/:year/:severity/during/:time_category' do
  content_type :json
  accidentCol = settings.mongo_db['Accident']
  result = accidentCol.find({:year => params[:year].to_i, :severity => params[:severity], :timeCategory => params[:time_category]})
  return "{'year':'#{params[:year]}', 'accidents':[]}" if result.nil?
  return result.to_a.to_json
end
 
# main page erb for nottingham traffic accidents
get '/nottinghamtrafficaccidents' do
  erb :nottm_traffic_accidents
end


