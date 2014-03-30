#!/usr/bin/env ruby
require 'sinatra'
require 'rubygems'
require 'rest_client'
require 'json'
require 'set'
require 'mongo'
require 'uri'
require 'pp'
require 'oauth'
require 'feedzirra'

include Mongo

$stdout.sync = true
accidentFields = ["_id", "accidentDate", "driverAges", "driverSexes", "lat", "lng", "month", "numVeh", "pedestrianSeverity", "persons", "severity", "time", "timeCategory", "year"]

configure :production do
  require 'newrelic_rpm'
end

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
  redirect '/unlockphiladelphia'
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
  return result["buses"].to_json
end

get '/septa/bus/movements/history/count' do
  content_type :json
  bus_movements_col = settings.mongo_db['bus_movements']
  count = bus_movements_col.count()
  doc = {}
  doc["result"] = count
  return doc.to_json
end

get '/septa/bus/movements/history/:start/:totalresults' do
  content_type :json
  settings.mongo_db['bus_movements'].find().sort(:date_time).skip(params[:start].to_i).limit(params[:totalresults].to_i).to_a.to_json
end

# main page erb for the bus explorer
get '/phillybusexplorer' do
  redirect '/busexplorer'
end

# main page erb for the bus explorer
get '/busexplorer' do
  zonesCol = settings.mongo_db['Zones']
  zones = zonesCol.find(nil,{:fields => {"_id" => 1, "name" => 1}}).to_a
  puts(zones);
  erb :bus_explorer, :locals => {:zones => zones}
end

# -------- Nottingham Traffic Accidents --------------

# get accidents by year
get '/nottinghamtraffic/accidents/' do
  content_type :json
  accidentCol = settings.mongo_db['Accident']
  result = accidentCol.find({}, :fields => accidentFields)
  return "{'year':'#{params[:year]}', 'accidents':[]}" if result.nil?
  return result.to_a.to_json
end

# get accidents by year
get '/nottinghamtraffic/accidents/:year' do
  content_type :json
  accidentCol = settings.mongo_db['Accident']
  result = accidentCol.find({:year => params[:year].to_i}, :fields => accidentFields)
  return "{'year':'#{params[:year]}', 'accidents':[]}" if result.nil?
  return result.to_a.to_json
end

# get accidents by year and severity
get '/nottinghamtraffic/accidents/:year/:severity' do
  content_type :json
  accidentCol = settings.mongo_db['Accident']
  result = accidentCol.find({:year => params[:year].to_i, :severity => params[:severity]}, :fields => accidentFields)
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

# for testing bootstrap layout
get '/bootstraplayouttest' do
  erb :bootstrap_layout_test
end

get '/unlockphiladelphia' do
  erb :unlock_philadelphia
end

get '/busmovements' do
  erb :bus_movements
end


# --- get from Wunderground
# gets the first observation for the day that is equal to or greater than the passed time

get '/weather/:lat/:lng/:date/:time' do
  content_type :json
  uri = "http://api.wunderground.com/api/c9976b65ce0c1ca8/history_#{params[:date]}/q/#{params[:lat]},#{params[:lng]}.json"
  response = RestClient.get uri
  jsonResp = JSON.parse(response)
  hourOfRequest = params[:time][0..1].to_i
  jsonResp['history']['observations'].each do | observation |
    hour = observation['date']['hour'].to_i
    if hour == hourOfRequest
    return observation.to_json;
    end
  end
  # otherwise just return last value
  return jsonResp['history']['observations'][jsonResp['history']['observations'].length - 1].to_json
end

get '/septa/elevator/outages' do
  content_type :json
  return getElevatorOutagesFromSeptaJson();
end


# sample response from SEPTA {"meta":{"elevators_out":1,"updated":"2013-09-26 13:31:57"},"results":[{"line":"Norristown High Speed Line","station":"Norristown Transportation Center","elevator":"Street Level","message":"No access to\/from station","alternate_url":"http:\/\/www.septa.org\/access\/alternate\/nhsl.html#ntc"}]}
def getElevatorOutagesFromSeptaJson()
  uri = "http://www3.septa.org/hackathon/elevator/"
  response = RestClient.get uri
  return response;
end


get '/septa/stations/line/:line' do
  content_type :json
  outages = JSON.parse(getElevatorOutagesFromSeptaJson());
  stationsCol = settings.mongo_db['septa_stations']
  if (params[:line] == "ALL")
    result = stationsCol.find({:$or => [{:MFL => "1"}, {:BSS => "1"}, {:NHSL => "1"}] })
  else
    result = stationsCol.find({params[:line] => "1"})
  end
  doc = {}
  doc["line"] = "#{params[:line]}"
  doc["stations"]=result.to_a
  doc["stations"].each_with_index do | station, i |
    outages["results"].each do | outage |
      puts "comparing outage " + outage["station"].gsub(/-/, ' ').gsub(/Street/, 'St') + " with " + station["stop_name"].gsub(/-/, ' ').gsub(/Street/, 'St')
      # have to remove hypens due to naming inconsistency and also abbreviate Street to St
      if station["stop_name"].gsub(/-/, ' ').gsub(/Street/, 'St').include?(outage["station"].gsub(/-/, ' ').gsub(/Street/, 'St'))
        puts "found match!"
        doc["stations"][i]["elevatorOutage"] = outage;
      end
    end
  end
  return doc.to_json
end

get '/yelp/wheelchairaccess/:lat/:lng/:radius' do
  consumer_key = ENV['YELP_CONSUMER_KEY']
  consumer_secret = ENV['YELP_CONSUMER_SECRET']
  token = ENV['YELP_TOKEN']
  token_secret = ENV['YELP_TOKEN_SECRET']
  api_host = 'api.yelp.com'
  consumer = OAuth::Consumer.new(consumer_key, consumer_secret, {:site => "http://#{api_host}"})
  access_token = OAuth::AccessToken.new(consumer, token, token_secret)
  path = "/v2/search?term=wheelchair+accessible&ll=#{params[:lat]},#{params[:lng]}&radius_filter=#{params[:radius]}&sort=1"
  access_token.get(path).body
end



