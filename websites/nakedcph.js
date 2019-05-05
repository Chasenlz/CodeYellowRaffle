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
const faker = require('faker');

function formatProxy(proxy) {
	if (proxy == '') {
		return '';
	}	
	try 
	{
		var sProxy = proxy.split(':');
	} catch (e)
	{
		return '';
	}
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
	if (shouldStop(task) == true) {
        return;
    }
	if(checkEmail(task))
	{
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	var jar = require('request').jar()
	var request = require('request').defaults({
		jar: jar
	});
	
	if(profile['jigProfileName'] == true)
	{
		profile['firstName'] = faker.fake("{{name.firstName}}");
		profile['lastName'] = faker.fake("{{name.lastName}}");
	}

	if(profile['jigProfileAddress'] == true)
	{
		profile['aptSuite'] = faker.fake("{{address.secondaryAddress}}");
	}

	if(profile['jigProfilePhoneNumber'] == true)
	{
		profile['phoneNumber'] = faker.fake("{{phone.phoneNumberFormat}}");
	}

	request({
		url: task['variant'],
		headers: {
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
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
	if (shouldStop(task) == true) {
        return;
    }
	if(checkEmail(task))
	{
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Obtaining raffle token'
	});
	request({
		url: task['nakedcph']['raffleToken'],
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Referer': task['variant'],
			'Origin': 'https://nakedcph.typeform.com',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
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
				message: 'Submitting entry in ' + task['nakedcph']['submit_delay'] / 1000 + 's to decrease automation detection'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, raffleToken, landedAt), task['nakedcph']['submit_delay']);
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
	if (shouldStop(task) == true) {
        return;
    }
	if(checkEmail(task))
	{
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	var form = JSON.parse(`{"${task['nakedcph']['firstName']}": "${profile['firstName']}","${task['nakedcph']['lastName']}": "${profile['lastName']}","${task['nakedcph']['email']}": "${task['taskEmail']}","${task['nakedcph']['country']}": "${countryFormatter(profile['country'])}","form[token]": "${raffleToken}","form[landed_at]": "${landedAt}","form[language]": "en"}`);
	request({
		url: task['nakedcph']['submitRaffle'],
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Referer': task['variant'],
			'Origin': 'https://nakedcph.typeform.com',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
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
				mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '');
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
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
				return setTimeout(() => exports.submitRaffle(request, task, profile, raffleToken, landedAt), task['nakedcph']['submit_delay']);
			}
			if (error == 'invalid-token') {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Raffle not found'
				});
				console.log('Raffle not found');
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
		}
	});
}


// Check if task should stop, for example if deleted
function shouldStop(task) {
    if (mainBot.taskStatuses[task['type']][task['taskID']] == 'stop') {
        mainBot.taskStatuses[task['type']][task['taskID']] = 'idle';
        return true;
    } else if (mainBot.taskStatuses[task['type']][task['taskID']] == 'delete') {
        mainBot.taskStatuses[task['type']][task['taskID']] = '';
        return true;
    } else {
        return false;
    }
}

// Checks if this email was already entered into a raffle
function checkEmail(task)
{
	if(task['taskTypeOfEmail'] == 'saved')
	{
		if(global.emails[task['taskEmail']] == undefined)
		{
			return false;
		}
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
		if(global.emails[task['taskEmail']] == undefined)
		{
			return;
		}
		var variantName = task['taskSiteSelect'] + '_' + task['filterID'];
		global.emails[task['taskEmail']][variantName] = true;
		mainBot.saveEmails(global.emails);
	}
}


// Needed for country localizations being different per site
function countryFormatter(profileCountry) {
	switch (profileCountry) {
		case 'United Kingdom':
			return 'United Kingdom';
			break;
		case 'United States':
			return 'United States of America';
			break;
		case 'Canada':
			return 'Canada';
			break;
		case 'North Ireland':
			return 'Ireland';
			break;
		case 'Germany':
			return 'Germany';
			break;
		case 'Switzerland':
			return 'Switzerland';
			break;
		case 'France':
			return 'France';
			break;
		case 'Spain':
			return 'Spain';
			break;
		case 'Italy':
			return 'Italy';
			break;
		case 'Netherlands':
			return 'Netherlands';
			break;
		case 'Czech Republic':
			return 'Czech Republic';
			break;
	}
}