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

function getRandomProxy() {
	return '';
}

exports.performTask = function (task, profile) {
	var jar = require('request').jar()
	var request = require('request').defaults({
		jar: jar
	});

	request({
		url: task['variant'],
		headers: {
			'authority': 'raffle.vooberlin.com',
			'cache-control': 'max-age=0',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
		},
		proxy: task['proxy'],
	}, function (error, response, body) {
		if (error) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('Error, retrying (notify user)');
			return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
		if (response.statusCode == 200) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				message: 'Got raffle page'
			});
			console.log('Got raffle page');
			$ = cheerio.load(body);
			var raffleToken = $('input[name="token"]').attr('value');
			var pageID = $('input[name="page_id"]').attr('value');
			if (raffleToken == undefined || pageID == undefined) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					message: 'Raffle not found'
				});
				console.log('Raffle not found');
				return;
			}
			console.log('Got rafle token: ' + raffleToken);
			console.log('Got page ID: ' + pageID);
			console.log('Now needs captcha');
			mainBot.requestCaptcha('vooberlin', task, false);
			const capHandler = () => {
				if (mainBot.taskCaptchas[task['taskID']] == undefined || mainBot.taskCaptchas[task['taskID']] == '') {
					setTimeout(() => capHandler(), 100);
				} else {
					exports.submitRaffle(request, task, profile, raffleToken, pageID);
					return;
				}
			}
			capHandler();

		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('Error, retrying (notify user)');
			return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
	});
}




exports.submitRaffle = function (request, task, profile, raffleToken, pageID) {
	if (mainBot.taskCaptchas[task['taskID']] == undefined || mainBot.taskCaptchas[task['taskID']] == '') {
		// NEEDS CAPTCHA AGAIN
		return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
	}
	request({
		url: 'https://raffle.vooberlin.com/ajax.php',
		method: 'POST',
		headers: {
			'origin': 'https://raffle.vooberlin.com',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'referer': task['variant'],
			'authority': 'raffle.vooberlin.com',
			'x-requested-with': 'XMLHttpRequest'
		},
		body: 'token=' + raffleToken + '&page_id=' + pageID + '&shoes_size=69&action=send_request&fax=&name=Abrar&lastname=Lone&email=abrarlone01@outlook.com&contact_number=7578647052&streetname=53 Marshfield Road&housenumber=53 Marshfield Road&postalcode=BS16 4BG&city=Bristol&country=United Kingdom&countryhidden=&g-recaptcha-response=' + mainBot.taskCaptchas[task['taskID']]
	}, function callback(error, response, body) {
		body = JSON.parse(body);
		console.log(body);
		if(body.error == true)
		{
			console.log('ERROR: ' + body.msg);
			if(body.msg == 'Error Captcha!')
			{
				mainBot.taskCaptchas[task['taskID']] = '';
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					message: 'Captcha error! Retrying'
				});
				return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
			}
			else if(body.msg == 'You can register only once per raffle!')
			{
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					message: 'Already entered!'
				});
				return;
			}
		}
		else
		{
			mainBot.taskCaptchas[task['taskID']]
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				message: 'Entry submitted!'
			});
			return;
		}
	});
}



