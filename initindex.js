var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
	log:'trace'
});

deleteIndex(client);

function deleteIndex(client) {
	client.indices.delete({
		index: 'mymusic'
	}, function(err,response) {
		console.log("Delete index!");
		if (err) {
			console.log(err);
		} else {
			console.log(response);
			sendSettings();
		}
	});
}

function sendSettings() {
	client.indices.create({
		index: 'mymusic',
        "number_of_shards": 1,
        "number_of_replicas": 0
	}, function(err,response) {
		console.log("create index!");
		if (err) {
			console.log(err);
		} else {
			console.log(response);
			sendMapping();
		}
	});
}

function sendMapping() {
	client.indices.putMapping({
		index:'mymusic',
		type:'itunes',
		body: {
            "_all": {
                "enabled": true
            },
            "properties": {
                "artist": {
                    "type": "string",
                    "fields" : {
                        "untouched": {"type":"string", "index":"not_analyzed"}
                    }
                },
                "title": {
                    "type": "multi_field",
                    "fields" : {
                        "title": {"type":"string", "index":"analyzed"},
                        "untouched": {"type":"string", "index":"not_analyzed"}
                    }
                }
            }
        }
	}, function(err,response) {
		console.log("Put mapping !");
		if (err) {
			console.log(err);
		} else {
			console.log(response);
		}
	});

}