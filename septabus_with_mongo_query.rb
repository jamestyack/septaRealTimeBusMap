include Mongo

configure do
  conn = MongoClient.new("localhost", 27017)
  set :mongo_connection, conn
  set :mongo_db, conn.db('septa')
end
 
get '/septa/bus/positions' do
 	coll = settings.mongo_db['bus_positions']
	
 	start_time =   Time.local(2013,06,05,17,00);
 	end_time =   Time.local(2013,06,05,17,05);

	# find all bus_position docs within time window
 	cursor = coll.find({
        :datetime => {
          :$gte => start_time,
         :$lt => end_time
        }
    })

	routes = Set.new()
	response = {'positions' => [], 'daterangefrom' => start_time, 'daterangeto' => end_time}

	cursor.each do | doc | 
		if (!routes.include?(doc['route']))
			response['positions'] << doc
			routes.add(doc['route'])
		end
	end
	content_type "application/json"
	response.to_json
	
end


get '/septa/bus/:id' do
	RestClient.get "http://www3.septa.org/transitview/bus_route_data/#{params[:id]}"
end
