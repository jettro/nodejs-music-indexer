var fs = require('fs');
var mm = require('musicmetadata');
var http = require('http');
var walk = require('walk');

var walker  = walk.walk('/Users/jettrocoenradie/Music/iTunes/iTunes Media/Music', { followLinks: false });

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
	var searchString = JSON.stringify(searchObj);

	var headers = {
			'Content-Type': 'application/json',
			'Content-Length': searchString.length
	};

	var opts = {
		host: 'localhost',
		port: 9200,
		path: '/mymusic/itunes',
		method: 'POST',
		headers: headers
	};

	// Setup the request.  The options parameter is
	// the object we defined above.
	var req = http.request(opts, function(res) {
		res.setEncoding('utf-8');

		var responseString = '';

		res.on('data', function(data) {
			responseString += data;
		});

		res.on('end', function() {
			try {
				var resultObject = JSON.parse(responseString);
			} catch (e) {
				console.log(e);
			}
		});
	});

	req.on('error', function(e) {
	  console.log(e);
	});

	req.write(searchString);
	req.end();
}
