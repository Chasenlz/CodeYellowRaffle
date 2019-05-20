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
var faker = require('faker');

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
	
	if (task['taskTypeOfEmail'] == 'catchall') {
		var pickEmail = Math.floor(Math.random() * 7) + 1;
		if(pickEmail == 1)
		{
			var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
			var email = profile['firstName'].toLowerCase() + rand + "@" + task['taskEmail'];
			task['taskEmail'] = email;
		}
		else if(pickEmail == 2)
		{
			var rand = Math.floor(Math.random() * 9000) + 1000; // For Email
			var email = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand + "@" + task['taskEmail'];
			task['taskEmail'] = email;
		}
		else if(pickEmail == 3)
		{
			var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982; 
			var email = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + rand + "@" + task['taskEmail'];
			task['taskEmail'] = email;
		}
		else if(pickEmail == 4)
		{
			var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982; 
			var email = profile['firstName'].toLowerCase() + rand + "@" + task['taskEmail'];
			task['taskEmail'] = email;
		}
		else if(pickEmail == 5)
		{
			var rand = Math.floor(Math.random() * (2000 - 1982)) + 1982; 
			var email = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand + "@" + task['taskEmail'];
			task['taskEmail'] = email;
		}
		else if(pickEmail == 6)
		{
			var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
			var email = profile['lastName'].toLowerCase() + profile['firstName'].toLowerCase() + rand + "@" + task['taskEmail'];
			task['taskEmail'] = email;
		}
		else
		{
			var email = profile['firstName'].toLowerCase() + profile['lastName'].toLowerCase() + "@" + task['taskEmail'];
			task['taskEmail'] = email;
		}
	}

	if(profile['jigProfileAddress'] == true)
	{
		profile['aptSuite'] = faker.fake("{{address.secondaryAddress}}");
	}

	if(profile['jigProfilePhoneNumber'] == true)
	{
		profile['phoneNumber'] = faker.fake("{{phone.phoneNumberFormat}}");
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Obtaining Size ID'
	});
	request({
		url: task['footshop']['sizesAPI'],
		headers: {
			'authority': 'releases.footshop.com',
			'cache-control': 'max-age=0',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		proxy: formatProxy(task['proxy']),
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			var parsed = JSON.parse(body);
			var sizes = parsed['sizeSets']['Unisex']['sizes'];
			for (var i = 0; i < sizes.length; i++) {
				if (sizes[i]['us'] == task['taskSizeSelect']) {
					var sizeID = sizes[i]['id'];
					console.log('Got Size ID : ' + sizeID);
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'GOT SIZE ID'
					});
					exports.getRaffle(request, task, profile, sizeID);
				}
			}
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay);
		}
	});


}


exports.getRaffle = function (request, task, profile, sizeID) {
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
	var raffleURL = 'https://releases.footshop.com/register/' + task['variant'] + '/Unisex/' + sizeID;
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Obtaining raffle page'
	});
	request({
		url: raffleURL,
		headers: {
			'authority': 'releases.footshop.com',
			'cache-control': 'max-age=0',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		proxy: formatProxy(task['proxy']),
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('Got raffle page');
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle page'
			});
			request({
				url: 'https://releases.footshop.com/api/registrations/check-duplicity/' + task['variant'],
				method: 'POST',
				headers: {
					'origin': 'https://releases.footshop.com',
					'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
					'content-type': 'application/json;charset=UTF-8',
					'accept': 'application/json, text/plain, */*',
					'cache-control': 'no-cache',
					'authority': 'releases.footshop.com',
					'referer': raffleURL
				},
				body: {
					email: task['taskEmail'],
					phone: profile['phoneNumber'],
					id: null
				},
				json: true,
				proxy: formatProxy(task['proxy']),
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log(body);
					if (body.email == true) {
						console.log('Email used before');
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Email previously entered'
						});
					} else if (body.phone == true) {
						console.log('Phone number used before');
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Phone number previously entered'
						});
					} else {
						exports.submitRaffle(request, task, profile, sizeID)
					}
				} else {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.getRaffle(request, task, profile, sizeID), global.settings.retryDelay);
				}
			});
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.getRaffle(request, task, profile, sizeID), global.settings.retryDelay);
		}
	});
}


exports.submitRaffle = function (request, task, profile, sizeID) {
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
	console.log('Submitting entry');
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Submitting entry'
	});
	request({
		url: 'https://api2.checkout.com/v2/tokens/card',
		method: 'POST',
		headers: {
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Referer': 'https://js.checkout.com/frames/?v=1.0.16&publicKey=pk_76be6fbf-2cbb-4b4a-bd3a-4865039ef187&localisation=EN-GB&theme=standard',
			'Origin': 'https://js.checkout.com',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
			'AUTHORIZATION': 'pk_76be6fbf-2cbb-4b4a-bd3a-4865039ef187',
			'Content-Type': 'application/json'
		},
		body: {
			number: profile['cardNumber'].split(" ").join(""),
			expiryMonth: profile['expiryMonth'],
			expiryYear: profile['expiryYear'].substr(profile['expiryYear'].length - 2),
			cvv: profile['CVV'],
			requestSource: 'JS'
		},
		json: true,
		proxy: formatProxy(task['proxy']),
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var cardToken = body['id'];
			console.log(cardToken + ' Card token received');
			request({
				url: 'https://releases.footshop.com/api/registrations/create/' + task['variant'],
				method: 'POST',
				headers: {
					'origin': 'https://releases.footshop.com',
					'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
					'content-type': 'application/json;charset=UTF-8',
					'accept': 'application/json, text/plain, */*',
					'cache-control': 'no-cache',
					'authority': 'releases.footshop.com',
					'referer': 'https://releases.footshop.com/register/' + task['variant'] + '/Unisex/' + sizeID
				},
				body: {
					"id": null,
					"sizerunId": sizeID,
					"account": "New Customer",
					"email": task['taskEmail'],
					"phone": profile['phoneNumber'],
					"gender": "Mr",
					"firstName": profile['firstName'],
					"lastName": profile['lastName'],
					"birthday": `${getRandomInt(1982, 2000)}-0${getRandomInt(1, 9)}-0${getRandomInt(1, 9)}`,
					"deliveryAddress": {
						"country": countryFormatter(profile['country']),
						"state": profile['stateProvince'],
						"county": "",
						"city": profile['city'],
						"street": profile['address'],
						"houseNumber": profile['address'],
						"additional": profile['aptSuite'],
						"postalCode": profile['zipCode']
					},
					"consents": ["privacy-policy-101"],
					"cardToken": cardToken,
					"cardLast4": profile['cardNumber'].substr(profile['cardNumber'].length - 4)
				},
				json: true,
				proxy: formatProxy(task['proxy']),
			}, function callback(error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log(body);
					if (!body['secure3DRedirectUrl']) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Unknown Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
						});
						return setTimeout(() => exports.submitRaffle(request, task, profile, sizeID), global.settings.retryDelay);
					} else {
						var open = require("open");
						registerEmail(task);
						mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], body['secure3DRedirectUrl'], '');	
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Open ' + body['secure3DRedirectUrl']
						});
						open(body['secure3DRedirectUrl']);
						console.log(body);
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					}
				} else {
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.submitRaffle(request, task, profile, sizeID), global.settings.retryDelay);
				}
			});

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
			return 'GB';
			break;
		case 'United States':
			return 'US';
			break;
		case 'Canada':
			return 'CA';
			break;
		case 'North Ireland':
			return 'IE';
			break;
		case 'Germany':
			return 'DE';
			break;
		case 'Switzerland':
			return 'CH';
			break;
		case 'France':
			return 'FR';
			break;
		case 'Spain':
			return 'ES';
			break;
		case 'Italy':
			return 'IT';
			break;
		case 'Netherlands':
			return 'NL';
			break;
		case 'Czech Republic':
			return 'CZ';
			break;
	}
}





// Random birthday
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}