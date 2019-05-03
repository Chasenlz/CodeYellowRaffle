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
	if (shouldStop(task.taskID) == true) {
		return;
	}
	if (checkEmail(task)) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task.taskID] = 'idle';
		return;
	}
	var jar = require('request').jar()
	var request = require('request').defaults({
		jar: jar
	});
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Creating account'
	});
	var taskPassword = makePassword(15);
	request({
		url: 'https://www.oneblockdown.it/index.php',
		method: 'POST',
		headers: {
			'origin': 'https://www.oneblockdown.it',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'accept': 'application/json, text/javascript, */*; q=0.01',
			'referer': 'https://www.oneblockdown.it/en/login',
			'authority': 'www.oneblockdown.it',
			'x-requested-with': 'XMLHttpRequest'
		},
		formData: {
			'controller': 'auth',
			'action': 'register',
			'extension': 'obd',
			'email': task['taskEmail'],
			'password': taskPassword,
			'firstName': profile['firstName'],
			'lastName': profile['lastName'],
			'birthDate': `${getRandomInt(1982, 2000)}-${getRandomInt(1, 9)}-${getRandomInt(1, 9)}`,
			'sex': 'MALE',
			'privacy[1]': '1',
			'privacy[2]': '1',
			'version': '100'
		}
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			try {
				parsed = JSON.parse(body)
			} catch (e) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Parsing error.'
				});
				return;
			}
			if (parsed.success) {
				task['taskPassword'] = taskPassword;
				console.log(parsed);
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Account created. Press start again when email confirmed'
				});
				mainBot.tasksAwaitingConfirm[task['type']][task.taskID] = 'awaiting';
				const confirmedEmailHandler = () => {
					if (mainBot.tasksAwaitingConfirm[task['type']][task['taskID']] != 'confirmed') {
						setTimeout(() => confirmedEmailHandler(), 200);
					} else {
						exports.login(request, task, profile);
						return;
					}
				}
				confirmedEmailHandler();
			} else {
				//parsed.error.reference
				// EMAIL_EXISTS
				if (parsed.error.reference == 'EMAIL_EXISTS') {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Account already exists'
					});
					return;
				} else {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Unknown error'
					});
					return;
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




exports.login = function (request, task, profile) {
	if (shouldStop(task.taskID) == true) {
		return;
	}
	if (checkEmail(task)) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task.taskID] = 'idle';
		return;
	}
	request({
		url: 'https://www.oneblockdown.it/index.php',
		method: 'POST',
		headers: {
			'origin': 'https://www.oneblockdown.it',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'accept': 'application/json, text/javascript, */*; q=0.01',
			'referer': 'https://www.oneblockdown.it/en/login',
			'authority': 'www.oneblockdown.it',
			'x-requested-with': 'XMLHttpRequest'
		},
		formData: {
			'controller': 'auth',
			'action': 'authenticate',
			'type': 'standard',
			'extension': 'obd',
			'credential': task['taskEmail'],
			'password': task['taskPassword'],
			'version': '100'
		},
		followAllRedirects: true
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got login endpoint'
			});
			try {
				parsed = JSON.parse(body)
			} catch (e) {}
			if (parsed.success) {
				if (!parsed.payload) {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Unknown login error'
					});
					return;
				}
				var userId = parsed.payload;
				request({
					url: 'https://www.oneblockdown.it/en/login',
					headers: {
						'authority': 'www.oneblockdown.it',
						'cache-control': 'max-age=0',
						'upgrade-insecure-requests': '1',
						'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
						'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
						'referer': 'https://www.oneblockdown.it/en/login',
						'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
					}
				}, function callback(error, response, body) {
					if (!error && response.statusCode == 200) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Logged in'
						});
						exports.getRaffle(request, task, profile, userId)
					} else {
						var proxy2 = getRandomProxy();
						task['proxy'] = proxy2;
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
						});
						return setTimeout(() => exports.login(request, task, profile), global.settings.retryDelay);
					}
				});
			} else {
				mainBot.tasksAwaitingConfirm[task['type']][task['taskID']] = 'awaiting';
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Please confirm your email and press start again'
				});
				const confirmedEmailHandler = () => {
					if (mainBot.tasksAwaitingConfirm[task['taskID']] != 'confirmed') {
						setTimeout(() => confirmedEmailHandler(), 200);
					} else {
						exports.login(request, task, profile);
						return;
					}
				}
				confirmedEmailHandler();
			}
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.login(request, task, profile), global.settings.retryDelay);
		}
	});
}


exports.getRaffle = function (request, task, profile, userId) {
	if (shouldStop(task.taskID) == true) {
		return;
	}
	if (checkEmail(task)) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task.taskID] = 'idle';
		return;
	}
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Obtaining raffle page'
	});
	request({
		url: task['variant'],
		headers: {
			'authority': 'www.oneblockdown.it',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
		}
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			console.log('Got raffle page');
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle page'
			});
			console.log('User ID: ' + userId);
			exports.submitRaffle(request, task, profile, userId)
		} else {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.getRaffle(request, task, profile, userId), global.settings.retryDelay);
		}
	});
}


exports.submitRaffle = function (request, task, profile, userId) {
	if (shouldStop(task.taskID) == true) {
		return;
	}
	if (checkEmail(task)) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task.taskID] = 'idle';
		return;
	}
	console.log('Submitting entry');
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Submitting entry'
	});
	// Captcha bypass = fake value in response
	request({
		url: 'https://www.oneblockdown.it/index.php',
		method: 'POST',
		headers: {
			'origin': 'https://www.oneblockdown.it',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'accept': 'application/json, text/javascript, */*; q=0.01',
			'referer': task['variant'],
			'authority': 'www.oneblockdown.it',
			'x-requested-with': 'XMLHttpRequest'
		},
		formData: {
			'extension': 'raffle',
			'controller': 'raffles',
			'action': 'subscribe',
			'response': '03AOLTBLTA6oaXtl3pUpnzYqYDPv8yguApR3yjXbjepgtQGvQPEoU3X_7y-_UY4hzrALZZGVD7zAXHLDmH3eQtyI-_B1wpk3OXTmA8QejJ5QpeUsiodh0XkSh2XZ6jErkSOfZIOrF2oykLmGMCRUQZPoeiBQV0Isv6Xp_yVeTqJDu6dSF0YZtf3VmKmT_uHF-PzGwOT4Sqwo44dsWcnHQ-SQdl6vrC3Wk2CiZelQCnuRg-xnHAKt3Zn9Vvq9IRyqlSgmjD-hL08eV3VCRC8rr-w28BjINB3u5oKWCXa6YOk-ki2o8uuNEuJxWFKDKbWQH-xBDgpQKTt89w',
			'userId': userId,
			'stockItemId': sizeFormatter(task['taskSizeSelect']),
			'itemId': '12339',
			'raffleId': '66',
			'inStore': '',
			'addressId': 'n',
			'address[countryId]': '77',
			'address[first_name]': 'Abrar',
			'address[last_name]': 'Lone',
			'address[street_address]': '53 Marshfield Road',
			'address[zipcode]': 'BS16 4BG',
			'address[cityName]': 'Bristol',
			'address[phone_number]': '7578647052',
			'address[statecode]': 'Alabama',
			'version': '100'
		}
	}, function callback(error, response, body) {
		if(error)
		{
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, userId), global.settings.retryDelay);
		}
		try {
			parsed = JSON.parse(body)
		} catch (e) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Parsing error.'
			});
			return;
		}
		if (parsed.success) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Entry submitted!'
			});
			registerEmail(task);
			mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '');
			mainBot.taskStatuses[task.taskID] = 'idle';
			return;
		} else {
			if (parsed['error']['message'] == 'INVALID_ADDRESS') {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Invalid address.'
				});
				return;
			}
		}
	});
}

// Check if task should stop, for example if deleted
function shouldStop(taskid) {
	if (mainBot.taskStatuses[taskid] == 'stop') {
		mainBot.taskStatuses[taskid] = 'idle';
		return true;
	} else if (mainBot.taskStatuses[taskid] == 'delete') {
		mainBot.taskStatuses[taskid] = '';
		return true;
	} else {
		return false;
	}
}

// Checks if this email was already entered into a raffle
function checkEmail(task) {
	if (task['taskTypeOfEmail'] == 'saved') {
		if (global.emails[task['taskEmail']][task['taskSiteSelect'] + '_' + task['filterID']] == true && task['type'] == 'mass') {
			return true;
		} else {
			return false;
		}
	}
}
// Saves email in emails.json to show email was entered 
function registerEmail(task) {
	if (task['taskTypeOfEmail'] == 'saved') {
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





function sizeFormatter(taskSize) {
	//stockItemId = size
	/* code to extract sizes from https://www.oneblockdown.it/en/footwear-sneakers/nike/men-unisex/nike-mars-yard-overshoe/12339
	for(var i = 0; i < preloadedStock.length; i++)
	{
		var size = preloadedStock[i]['variant'];
		size = parseFloat(size.match(/[\d\.]+/));
		var stockItemId = preloadedStock[i]['stockItemId'];
		console.log(`case '${size}':
				return '${stockItemId}';
				break;`);
	}*/
	switch (taskSize) {
		case '5.5':
			return '69121';
			break;
		case '6':
			return '69122';
			break;
		case '6.5':
			return '69123';
			break;
		case '7':
			return '69124';
			break;
		case '7.5':
			return '69125';
			break;
		case '8':
			return '69126';
			break;
		case '8.5':
			return '69127';
			break;
		case '9':
			return '69128';
			break;
		case '9.5':
			return '69129';
			break;
		case '10':
			return '69130';
			break;
		case '10.5':
			return '69131';
			break;
		case '11':
			return '69132';
			break;
		case '11.5':
			return '69133';
			break;
		case '12':
			return '69134';
			break;
	}
}


// Random birthday
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}


function makePassword(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}