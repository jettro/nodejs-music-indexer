var fs = require('fs');
var mm = require('musicmetadata');
var elasticsearch = require('elasticsearch');
var walk = require('walk');

var client = new elasticsearch.Client();

var walker  = walk.walk('/Users/jettrocoenradie/Music/iTunes/iTunes Media/Music/Agnes Obel', { followLinks: false });

walker.on('file', function(root, stat, next) {
    if (strEndsWith(stat.name,".m4a") || strEndsWith(stat.name,".mp3")) {
	    extractData(root + '/' + stat.name);
    }
    next();
});

walker.on('end', function() {
    console.log("We are done!");
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

function sendToElasticsearch(searchObj) {
	client.index({
		index: 'mymusic',
		type: 'itunes',
		body: searchObj
	}, function(err,response) {
		if (err) {
			console.log(err);
		} else {
			console.log(response);
		}
	});
}
