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

function formatProxy(proxy) {
	if (proxy == '') {
		return '';
	}
	var sProxy = proxy.split(':');
	var proxyHost = sProxy[0] + ":" + sProxy[1];
	if (sProxy.length == 2) {
		sProxy = "http://" + proxyHost;
		return (sProxy);
	} else {
		var proxyAuth = sProxy[2] + ":" + sProxy[3];
		sProxy = "http://" + proxyAuth.trimLeft().trimRight().toString() + "@" + proxyHost;
		return (sProxy);
	}
}

function getRandomProxy() {
	var proxies = global.proxies;
	if (proxies[0] != '') {
		var proxy = proxies[Math.floor(Math.random() * proxies.length)];
		return proxy;
	} else {
		return '';
	}
}

exports.performTask = function (task, profile) {
	if(checkEmail(task))
	{
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		return;
	}
	var jar = require('request').jar()
	var request = require('request').defaults({
		jar: jar
	});
	request({
		url: task['variant'],
		headers: {
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
		},
		proxy: formatProxy(task['proxy']),
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'GOT RAFFLE PAGE'
			});
			console.log('Got raffle page');
			exports.getRaffleToken(request, task, profile);
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
	});
}


exports.getRaffleToken = function (request, task, profile) {
	if(checkEmail(task))
	{
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		return;
	}
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Obtaining raffle token'
	});
	request({
		url: task['ymeuniverse']['raffleToken'],
		method: 'POST',
		headers: {
			'Origin': 'https://ymeuniverse.typeform.com',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Accept': 'application/json',
			'Referer': task['variant'],
			'Connection': 'keep-alive',
			'Content-Length': '0',
		},
		proxy: formatProxy(task['proxy']),
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			var parsed = JSON.parse(body);
			var raffleToken = parsed['token'];
			var landedAt = parsed['landed_at'];
			if (!raffleToken || !landedAt) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error obtaining token. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				return setTimeout(() => exports.getRaffleToken(request, task, profile), global.settings.retryDelay);
			}
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle token'
			});
			console.log('Raffle Token: ' + raffleToken);
			console.log('Landed at: ' + landedAt);
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle token'
			});
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Submitting entry in ' + task['ymeuniverse']['submit_delay'] / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, raffleToken, landedAt), task['ymeuniverse']['submit_delay']);
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.getRaffleToken(request, task, profile), global.settings.retryDelay);
		}
	});
}


exports.submitRaffle = function (request, task, profile, raffleToken, landedAt) {
	if(checkEmail(task))
	{
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		return;
	}
	var form = JSON.parse(
		`{"${task['ymeuniverse']['fullName']}": "${profile['firstName']} ${task['ymeuniverse']['lastName']}",
	"${task['ymeuniverse']['gender']}": "Man",
	"${task['ymeuniverse']['blank']}": "",
	"${task['ymeuniverse']['email']}": "${task['taskEmail']}",
	"${task['ymeuniverse']['size']}": "${sizeFormatter(task['taskSizeSelect'])}",
	"form[token]": "${raffleToken}",
	"form[landed_at]": "${landedAt}",
	"form[language]": "en"}`);
	request({
		url: task['ymeuniverse']['submitRaffle'],
		method: 'POST',
		headers: {
			'Origin': 'https://ymeuniverse.typeform.com',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Accept': 'application/json',
			'Referer': task['variant'],
			'Connection': 'keep-alive'
		},
		formData: form,
		proxy: formatProxy(task['proxy']),
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			try {
				parsed = JSON.parse(body);
			} catch (e) {}
			var message = parsed['message'];
			if (message == 'success') {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Entry submitted!'
				});
				registerEmail(task);
				mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '');
				return;
			}
		} else {
			console.log(body);
			try {
				parsed = JSON.parse(body);
			} catch (e) {}
			var error = parsed['error_code'];
			if (!error) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Unknown error. Please contact the developers'
				});
				return setTimeout(() => exports.submitRaffle(request, task, profile, raffleToken, landedAt), task['ymeuniverse']['submit_delay']);
			}
			if (error == 'invalid-token') {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Raffle not found'
				});
				console.log('Raffle not found');
				return;
			}
		}
	});
}




// Checks if this email was already entered into a raffle
function checkEmail(task)
{
	if(task['taskTypeOfEmail'] == 'saved')
	{
		if(global.emails[task['taskEmail']][task['taskSiteSelect'] + '_' + task['filterID']] == true && task['type'] == 'mass')
		{
			return true;
		}
		else
		{
			return false;
		}
	}
}
// Saves email in emails.json to show email was entered 
function registerEmail(task)
{
	if(task['taskTypeOfEmail'] == 'saved')
	{
		var variantName = task['taskSiteSelect'] + '_' + task['filterID'];
		global.emails[task['taskEmail']][variantName] = true;
		mainBot.saveEmails(global.emails);
	}
}


// Needed for size variants being different per site

function sizeFormatter(taskSize) {
	switch (taskSize) {
		case '4':
			return 'UK 3.5 / EU 36';
			break;
		case '4.5':
			return 'UK 4 / EU 36 2/3';
			break;
		case '5':
			return 'UK 4.5 / EU 37 1/3';
			break;
		case '5.5':
			return 'UK 5 / EU 38';
			break;
		case '6':
			return 'UK 5.5 / EU 38 2/3';
			break;
		case '6.5':
			return 'UK 6 / EU 39 1/3';
			break;
		case '7':
			return 'UK 6.5 / EU 40';
			break;
		case '7.5':
			return 'UK 7 / EU 40 2/3';
			break;
		case '8':
			return 'UK 7.5 / EU 41 1/3';
			break;
		case '8.5':
			return 'UK 8 / EU 42';
			break;
		case '9':
			return 'UK 8.5 / EU 42 2/3';
			break;
		case '9.5':
			return 'UK 9 / EU 43 1/3';
			break;
		case '10':
			return 'UK 9.5 / EU 44';
			break;
		case '10.5':
			return 'UK 10 / EU 44 2/3';
			break;
		case '11':
			return 'UK 10.5 / EU 45 1/3';
			break;
		case '11.5':
			return 'UK 11 / EU 46';
			break;
		case '12':
			return 'UK 11.5 / EU 46 2/3';
			break;
		case '12.5':
			return 'UK 12 / EU 47 1/3';
			break;
	}
}
