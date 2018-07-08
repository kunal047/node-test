var request = require("request");
var cheerio = require("cheerio");
var Promise = require("bluebird");
var fs = require("fs");
var get = Promise.promisify(request.get);

var maxConnections = 5; // maximum number of concurrent connections
unVisitedLinks = ["https://medium.com/"];
visitedLinks = [];
function scanPage(url) {
	// request the page at given url:

	visitedLinks.push(url);
	unVisitedLinks.shift();
	return get(url).then(res => {
		var body = res.body;
		$ = cheerio.load(body);
		links = $("a");
		$(links).each(function(i, link) {
			linkval = $(link).attr("href");
			unVisitedLinks.indexOf(unVisitedLinks) === -1
				? unVisitedLinks.push(linkval)
				: console.log("This item already exists");
		});
		towrite = `PARENT URL ---------------------------> ${url}
					\n\n\nURLs IN THE PARENT URL PAGE\n\n\n${unVisitedLinks}
					\n\n\n`;

		fs.appendFile("url_list.txt", towrite, err => {
			if (err) throw err;
			console.log("URLS Saved  !");
		});

		return Promise.map(unVisitedLinks, scanPage, {
			concurrency: maxConnections
		}).then(results => {
			var res = {};
			for (var i = 0; i < results.length; i++)
				res[unVisitedLinks[i]] = results[i];
			return res;
		});
	});
}

scanPage(unVisitedLinks[0]).then(res => {
	console.log("Program Ends");
});
