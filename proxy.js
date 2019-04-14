const request = require('request');
exports.testProxy = function(proxy, callback) {
   request.get({
			headers: {
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
			},
			proxy: proxy,
			url: 'https://www.supremenewyork.com/',
			time: true
		},
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				callback({ message: `VALID (${Math.floor(response.timingPhases.firstByte)}ms)` });
			} else {
				callback({ message: 'FAILED'});
			}
		});
}
