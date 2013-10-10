var zones = [];

var zone = new Object();
zone._id = "CCNS";
zone.name = "Center City - Routes N <-> S";
zone.buses = ["1", "2", "3", "4", "17", "23", "47M"];
zones.push(zone);
zone = new Object();
zone._id = "CCNE";
zone.name = "Center City - Routes NorthEast";
zone.buses = ["3", "78"];
zones.push(zone);
zone = new Object();
zone._id = "CCW";
zone.name = "Center City - Routes W / NW";
zone.buses = ["1", "10", "21", "42", "27", "32", "34", "36", "61"];
zones.push(zone);
zone = new Object();
zone._id = "CCFitler";
zone.name = "Center City Fitler";
zone.buses = ["7"];
zones.push(zone);

zone = new Object();
zone._id = "NLIB";
zone.name = "Northern Liberties and Fishtown";
zone.buses = ["5", "25", "43", "57"]
zones.push(zone);

zone = new Object();
zone._id = "OCNS";
zone.name = "Old City/Society Hill - Routes N <-> S";
zone.buses = ["5", "25", "33", "17", "47", "48", "57"];
zones.push(zone);
zone = new Object();
zone._id = "OCW";
zone.name = "Old City/Society Hill - Routes W / NW";
zone.buses = ["9", "12", "21", "42", "38", "44"];
zones.push(zone);

zone = new Object();
zone._id = "SE";
zone.name = "South Philly East of Broad";
zone.buses = ["4", "25", "29", "47", "47M", "57", "64", "68", "79"];
zones.push(zone);
zone = new Object();
zone._id = "SW";
zone.name = "South Philly West of Broad";
zone.buses = ["2", "4", "7", "17", "29", "37", "64", "68", "79"];
zones.push(zone);

zone = new Object();
zone._id = "West";
zone.name = "West Philly (Univ City)";
zone.buses = ["11", "13", "21", "30", "31", "35", "36", "38", "40", "42", "43", "46", "52", "64"];
zones.push(zone);

zone = new Object();
zone._id = "NW";
zone.name = "North-West Philadelphia";
zone.buses = ["9", "27", "35", "38", "43", "44", "61", "62", "65"];
zones.push(zone);

zone = new Object();
zone._id = "King";
zone.name = "King of Prussia / Norristown";
zone.buses = ["27", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "124", "125"];
zones.push(zone);

zone = new Object();
zone._id = "North";
zone.name = "North Philadelphia";
zone.buses = ["2", "4", "6", "7", "8", "15", "16", "18", "23", "26", "33", "39", "47", "48", "53", "54", "57", "60", "75"];
zones.push(zone);

// testing routes
// ne philadelphia - Frankford to NE ...
//routes['NE'] = ["3", "18", "19", "20", "24", "25", "28", "50", "56", "58", "59", "66", "67", "70", "73", "78", "84", "88", "89"]// northeast
//routes['103_120'] = ["103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120"];
//routes['123_150'] = ["123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "139", "150"];
//routes['201_310'] = ["201", "204", "205", "206", "310"];
//routes['Letters'] = ['G', 'J', 'K', 'L', 'LUCY', 'R', 'H', 'XH'];
//routes['Drex'] = ["36", "37", "68"];

db.Zones.remove({});
for (var i=0; i<zones.length; i++) {
	db.Zones.insert(zones[i]);
}
