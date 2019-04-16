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

var mainBot = require('../index.js')
var cheerio = require('cheerio');
// REPLACE 3000 WITH RETRY DELAY// REPLACE 3000 WITH RETRY DELAY// REPLACE 3000 WITH RETRY DELAY// REPLACE 3000 WITH RETRY DELAY
// REPLACE 3000 WITH RETRY DELAY// REPLACE 3000 WITH RETRY DELAY// REPLACE 3000 WITH RETRY DELAY// REPLACE 3000 WITH RETRY DELAY
function getRandomProxy()
{
    return '';
}

exports.performTask = function (task, profile) {
    //////////////////////////////////////////////////////console.log('trying');
	var jar = require('request').jar()
	var request = require('request').defaults({
		jar: jar
	});
	request({
		url: 'https://www.nakedcph.com/auth/view?op=register',
		method: 'GET',
		headers: {
			'authority': 'www.nakedcph.com',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
        },
        followAllRedirects: true,
		proxy: task['proxy'],
	}, function (error, response, body) {
		if (error) {
            var proxy2 = getRandomProxy();
            task['proxy'] = proxy2;
			//////////////////////////////////////////////////////console.log('\x1b[1;33m' + "[] - Error1");
            return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); 
		}
		if (response.statusCode == 200) {
			$ = cheerio.load(body);
			var csrfToken = $('input[name="_AntiCsrfToken"]').attr('value');
			console.log('\x1b[1;33m' + "[] - Got Registration Page");
			//createAccount(taskNum, proxy, request, csrfToken)
		} else {
			var proxy2 = getRandomProxy();
            task['proxy'] = proxy2;
			//////////////////////////////////////////////////////console.log('\x1b[1;33m' + "[] - Error2 " + response.statusCode);
            return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
	});
}



