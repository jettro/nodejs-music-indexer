var fs = require('fs');
var mm = require('musicmetadata');
var elasticsearch = require('elasticsearch');
var walk = require('walk');
var readline = require('readline');

var client = new elasticsearch.Client({
	host: '192.168.1.10:9200'
});

var walker  = walk.walk('/Users/jettrocoenradie/Music/iTunes/iTunes Media/Music', { followLinks: false });

walker.on('file', function(root, stat, next) {
    if (strEndsWith(stat.name,".m4a") || strEndsWith(stat.name,".mp3")) {
	    extractData(root + '/' + stat.name);
    }
    next();
});

walker.on('end', function() {
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.question("What do you think of node.js? ", function(answer) {
		console.log("Thank you for your valuable feedback:", answer);
  		rl.close();
		flushItems();
  		console.log("We are done!");
	});
});

function strEndsWith(str, suffix) {
    return str.match(suffix+"$")==suffix;
}

function extractData(file) {
	var parser = new mm(fs.createReadStream(file));
	parser.on('metadata', function (result) {
		console.log("Artist: " + result.artist[0] + ", Song name : " + result.title);
		delete result.picture;
		sendToElasticsearch(result);
	});
}

var items = [];
function sendToElasticsearch(searchObj) {
	console.log("Sending to elastic");
	items.push({"index":{}});
	items.push(searchObj);
	if (items.length >= 100) {
		flushItems();
	}
}

function flushItems() {
	console.log("Flushing items");
	client.bulk({
		index: 'mymusic',
		type: 'local',
		body: items
	}, function(err,response) {
		if (err) {
			console.log(err);
		}
		items = [];
	});
}

