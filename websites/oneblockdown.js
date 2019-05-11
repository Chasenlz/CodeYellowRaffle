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
var mainBot = require('../index.js')
var cheerio = require('cheerio');
const faker = require('faker');

function formatProxy(proxy) {
	if (proxy == '') {
		return '';
	}
	try {
		var sProxy = proxy.split(':');
	} catch (e) {
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
	if (checkEmail(task)) {
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
		jar: jar,
		timeout: 10000
	});

	if (profile['jigProfileName'] == true) {
		profile['firstName'] = faker.fake("{{name.firstName}}");
		profile['lastName'] = faker.fake("{{name.lastName}}");
	}

	if (profile['jigProfileAddress'] == true) {
		profile['aptSuite'] = faker.fake("{{address.secondaryAddress}}");
		// ********************************************* Add this only to sites with no address line 2 *********************************************
		profile['address'] = profile['address'] + ' ' + faker.fake("{{address.secondaryAddress}}");
		// ********************************************* Add this only to sites with no address line 2 *********************************************
	}

	if (profile['jigProfilePhoneNumber'] == true) {
		profile['phoneNumber'] = faker.fake("{{phone.phoneNumberFormat}}");
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Creating account'
	});
	console.log(`[${task.taskID}] ` + ' Creating account');
	task['taskPassword'] = makePassword(15);
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
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
			'action': 'register',
			'extension': 'obd',
			'email': task['taskEmail'],
			'password': task['taskPassword'],
			'firstName': profile['firstName'],
			'lastName': profile['lastName'],
			'birthDate': `${getRandomInt(1982, 2000)}-${getRandomInt(1, 9)}-${getRandomInt(1, 9)}`,
			'sex': 'MALE',
			'privacy[1]': '1',
			'privacy[2]': '1',
			'version': '100'
		},
		agent: agent
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
				console.log(`[${task.taskID}] ` + ' Parsing error');
				console.log(body);
				return;
			}
			if (parsed.success) {
				console.log(parsed);
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Account created. Press start again when email confirmed'
				});
				console.log(`[${task.taskID}] ` + ' Account created. Press start when confirmed');
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
						message: 'Account already exists. Checking DB'
					});
					request({
						url: 'https://codeyellow.io/api/getAccount.php',
						method: 'post',
						formData: {
							'email': task['taskEmail'],
							'token': global.settings.token
						},
					}, function (err, response, body) {
						console.log(body)
						try {
							var parsedAPI = JSON.parse(body);
							// IF CREDENTIALS ARE VALID
							if (parsedAPI.valid == true) {
								console.log("Saved credentials exist.")
								task['taskPassword'] = parsedAPI.password;
								exports.login(request, task, profile);
								return;
							}
							// IF CREDENTIALS ARE NOT VALID
							else {
								console.log("Account already exists.")
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: 'Account already exists.'
								});
								return;
							}
						} catch (error) {
							console.log('Account already exists.');
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Account already exists.'
							});
							return;
						}
					});
				} else {
					console.log(`[${task.taskID}] ` + ' Unknown error');
					console.log(body)
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
	if (shouldStop(task) == true) {
		return;
	}
	if (checkEmail(task)) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
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
		followAllRedirects: true,
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got login endpoint'
			});
			console.log(`[${task.taskID}] ` + ' Got login endpoint');
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
					console.log(`[${task.taskID}] ` + ' Unknown login error');
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
					},
					agent: agent
				}, function callback(error, response, body) {
					if (!error && response.statusCode == 200) {
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Logged in'
						});
						console.log(`[${task.taskID}] ` + ' Logged in');
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
				console.log(`[${task.taskID}] ` + ' Confirm and start again');
				const confirmedEmailHandler = () => {
					if (mainBot.tasksAwaitingConfirm[task['type']][task['taskID']] != 'confirmed') {
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
	if (shouldStop(task) == true) {
		return;
	}
	if (checkEmail(task)) {
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
		message: 'Obtaining raffle page'
	});
	console.log(`[${task.taskID}] ` + ' Obtaining raffle page');
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}
	request({
		url: task['variant'],
		headers: {
			'authority': 'www.oneblockdown.it',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			console.log('Got raffle page');
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle page'
			});
			console.log(`[${task.taskID}] ` + ' Got raffle page');
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
	if (shouldStop(task) == true) {
		return;
	}
	if (checkEmail(task)) {
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
		return;
	}
	console.log(`[${task.taskID}] ` + 'Submitting entry');
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Submitting entry'
	});
	console.log(`[${task.taskID}] ` + JSON.stringify(task));
	console.log(`[${task.taskID}] ` + JSON.stringify(profile));
	if (profile['stateProvince'] == null) {
		profile['stateProvince'] = '';
	}
	// Captcha bypass = fake value in response
	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
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
			'stockItemId': task['taskSizeVariant'],
			'itemId': task['oneblockdown']['itemId'],
			'raffleId': task['oneblockdown']['raffleId'],
			'inStore': '',
			'addressId': 'n',
			'address[countryId]': countryFormatter(profile['country']),
			'address[first_name]': profile['firstName'],
			'address[last_name]': profile['lastName'],
			'address[street_address]': profile['address'],
			'address[zipcode]': profile['zipCode'],
			'address[cityName]': profile['city'],
			'address[phone_number]': profile['phoneNumber'],
			'address[statecode]': profile['stateProvince'],
			'version': '100'
		},
		agent: agent
	}, function callback(error, response, body) {
		console.log(JSON.stringify({
			'extension': 'raffle',
			'controller': 'raffles',
			'action': 'subscribe',
			'response': '03AOLTBLTA6oaXtl3pUpnzYqYDPv8yguApR3yjXbjepgtQGvQPEoU3X_7y-_UY4hzrALZZGVD7zAXHLDmH3eQtyI-_B1wpk3OXTmA8QejJ5QpeUsiodh0XkSh2XZ6jErkSOfZIOrF2oykLmGMCRUQZPoeiBQV0Isv6Xp_yVeTqJDu6dSF0YZtf3VmKmT_uHF-PzGwOT4Sqwo44dsWcnHQ-SQdl6vrC3Wk2CiZelQCnuRg-xnHAKt3Zn9Vvq9IRyqlSgmjD-hL08eV3VCRC8rr-w28BjINB3u5oKWCXa6YOk-ki2o8uuNEuJxWFKDKbWQH-xBDgpQKTt89w',
			'userId': userId,
			'stockItemId': task['taskSizeVariant'],
			'itemId': task['oneblockdown']['itemId'],
			'raffleId': task['oneblockdown']['raffleId'],
			'inStore': '',
			'addressId': 'n',
			'address[countryId]': countryFormatter(profile['country']),
			'address[first_name]': profile['firstName'],
			'address[last_name]': profile['lastName'],
			'address[street_address]': profile['address'],
			'address[zipcode]': profile['zipCode'],
			'address[cityName]': profile['city'],
			'address[phone_number]': profile['phoneNumber'],
			'address[statecode]': profile['stateProvince'],
			'version': '100'
		}));
		console.log(body)
		console.log(`[${task.taskID}]` + response.statusCode);
		if (error) {
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
			mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', task['taskPassword']);
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			return;
		} else {
			if (parsed['error']['message'] == 'INVALID_ADDRESS') {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Invalid address.'
				});
				return;
			} else if (parsed.error.message == "You are already subscribed to this raffle") {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Already entered!'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			} else {
				console.log(body);
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Unknown error.'
				});
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
function checkEmail(task) {
	if (task['taskTypeOfEmail'] == 'saved') {
		if (global.emails[task['taskEmail']] == undefined) {
			return false;
		}
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
		if (global.emails[task['taskEmail']] == undefined) {
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
			return '77';
			break;
		case 'United States':
			return '233';
			break;
		case 'Canada':
			return '38';
			break;
		case 'North Ireland':
			return '77';
			break;
		case 'Ireland':
			return '102';
			break;
		case 'Germany':
			return '57';
			break;
		case 'Switzerland':
			return '43';
			break;
		case 'France':
			return '75';
			break;
		case 'Spain':
			return '68';
			break;
		case 'Italy':
			return '110';
			break;
		case 'Netherlands':
			return '166';
			break;
		case 'Czech Republic':
			return '56';
			break;
		case 'Australia':
			return '13';
			break;
		case 'Belgium':
			return '20';
			break;
		case 'Slovenia':
			return '200';
			break;
		case 'Singapore':
			return '198';
			break;
		case 'Malaysia':
			return '158';
			break;
		case 'Hong Kong':
			return '95';
			break;
		case 'China':
			return '48';
			break;
		case 'Japan':
			return '114';
			break;
		case 'Sweden':
			return '197';
			break;
		case 'Denmark':
			return '59';
			break;
		case 'Finland':
			return '70';
			break;
		case 'Romania':
			return '189';
			break;
	}
}





//stockItemId = size
/* code to extract sizes from https://www.oneblockdown.it/en/footwear-sneakers/nike/men-unisex/nike-mars-yard-overshoe/12339
var sizeList = '';
for(var i = 0; i < preloadedStock.length; i++)
{
	var size = preloadedStock[i]['variant'];
	size = parseFloat(size.match(/[\d\.]+/));
	var stockItemId = preloadedStock[i]['stockItemId'];
	sizeList = sizeList + `'${size}' => '${stockItemId}',`;
}*/


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