/*
	Copyright (C) 2019 Code Yellow

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program (license.md).  If not, see <http://www.gnu.org/licenses/>.
*/
var HttpsProxyAgent = require('https-proxy-agent');
const request = require('request');
exports.testProxy = function(proxy, callback) {
	var agent = new HttpsProxyAgent(proxy);
   request.get({
			headers: {
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
			},
			agent: agent,
			url: 'https://www.google.com/',
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


// Old proxy test

/*
const request = require('request');
exports.testProxy = function(proxy, callback) {
   request.get({
			headers: {
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
			},
			proxy: proxy,
			url: 'https://www.google.com/',
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
*/