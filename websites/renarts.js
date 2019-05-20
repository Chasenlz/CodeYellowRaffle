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
var faker = require('faker');

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
		jar: jar
	});

	if (profile['jigProfileName'] == true) {
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

	if (profile['country'] != 'United States') {
		profile["stateProvince"] = 'none';
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

	if (task['proxy'] != '') {
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	} else {
		agent = '';
	}

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Obtaining Raffle Page'
	});
	request({
		url: task['variant'],
		headers: {
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle page'
			});

			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Checking email'
			});
			request({
					url: 'https://renarts-draw.herokuapp.com/customers/validateEmail',
					method: 'POST',
					headers: {
						'Accept': 'application/json, text/javascript, */*; q=0.01',
						'Referer': task['variant'],
						'Origin': 'https://renarts.com',
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
						'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
					},
					formData: {
						'email': task['taskEmail'],
						'product_id': '3544647401544'
					},
					agent: agent
				},
				function callback(error, response, body) {
					if (!error) {
						if (body == 'Customer not found') // response.statusCode should be 404 Not Found
						{
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Creating customer'
							});
							// Continue
							request({
								url: 'https://renarts-draw.herokuapp.com/customers/new',
								method: 'POST',
								headers: {
									'Accept': 'application/json, text/javascript, */*; q=0.01',
									'Referer': task['variant'],
									'Origin': 'https://renarts.com',
									'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
									'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
								},
								formData: {
									'first_name': profile['firstName'],
									'last_name': profile['lastName'],
									'email': task['taskEmail']
								},
								agent: agent
							}, function callback(error, response, body) {
								if (!error && response.statusCode == 200) {
									var parsed = JSON.parse(body);
									if (parsed.message == 'Customer created successfully') {
										var customerID = parsed.id;
										console.log('Customer created');
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: 'Customer created'
										});
										exports.submitRaffle(request, task, profile, customerID);
									} else {
										console.log(body);
									}
								} else {
									if(error)
									{
										var proxy2 = getRandomProxy();
										task['proxy'] = proxy2;
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
										});
										return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay);
									}
									else
									{
										mainBot.mainBotWin.send('taskUpdate', {
											id: task.taskID,
											type: task.type,
											message: 'Make sure your profile is complete.'
										});
										console.log(`[${task.taskID}] ` + ' Error creating customer');
										console.log(body);
										mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
										return;
									}
								}
							});
						} else if (body == 'Entry already found') {
							// Already Entered
							console.log('Email used before');
							mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
							return mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Email previously entered'
							});
						} else {
							// Already Entered
							console.log('Email used before');
							mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
							return mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Email previously entered'
							});
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


exports.submitRaffle = function (request, task, profile, customerID) {
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

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Creating entry'
	});
	
	request({
		url: 'https://renarts-draw.herokuapp.com/draws/entries/new',
		method: 'POST',
		headers: {
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Referer': task['variant'],
			'Origin': 'https://renarts.com',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		},
		formData: {
			'shipping_first_name': profile['firstName'],
			'shipping_last_name': profile['lastName'],
			'customer_id': customerID,
			'variant_id': task['taskSizeVariant'],
			'street_address': profile['address'],
			'city': profile['city'],
			'zip': profile['zipCode'],
			'state': profile['stateProvince'],
			'phone': profile['phoneNumber'],
			'country': countryFormatter(profile['country']),
			'delivery_method': 'online',
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body);
			var parsed = JSON.parse(body);
			if (parsed.message == 'Entry successfully created') {
				var entryID = parsed.id;
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Entry created'
				});
				exports.tokenizeCard(request, task, profile, customerID, entryID);
			} else {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Unknown error. DM Log'
				});
				console.log(body);
				return;
			}
		}
	});
}

exports.tokenizeCard = function (request, task, profile, customerID, entryID) {
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

	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
		type: task.type,
		message: 'Tokenizing card'
	});

	request({
		url: 'https://api.stripe.com/v1/tokens',
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Referer': 'https://js.stripe.com/v3/controller-d96f9793b12b372ff70fb41d708a1560.html',
			'Origin': 'https://js.stripe.com',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		form: {
			key: 'pk_live_5Lmme6XlFQopCKpv9mkUutcl',
			'card[number]': profile['cardNumber'].split(" ").join(""),
			'card[cvc]': profile['CVV'],
			'card[exp_month]': profile['expiryMonth'],
			'card[exp_year]': profile['expiryYear'].substr(profile['expiryYear'].length - 2),
			payment_user_agent: 'stripe.js/fb99827c; stripe-js-v3/fb99827c',
			referrer: task['variant']
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error) {
			console.log(body);
			try
			{
				var parsed = JSON.parse(body);
			} catch (e) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Parsing error.'
				});
				console.log(`[${task.taskID}] ` + ' Parsing error');
				console.log(body);
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
			var cardToken = parsed['id'];
			if (!cardToken) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Make sure your card details are correct.'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
			request({
				url: 'https://renarts-draw.herokuapp.com/draws/entries/checkout',
				method: 'POST',
				headers: {
					'Accept': 'application/json, text/javascript, */*; q=0.01',
					'Referer': task['variant'],
					'Origin': 'https://renarts.com',
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				formData: {
					'checkout_token': cardToken,
					'entry_id': entryID
				},
				agent: agent
			}, function callback(error, response, body) {
				if (!error) {
					if(body == "Your card was declined.")
					{
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Card Declined'
						});
						console.log(`[${task.taskID}] ` + ' Card declined');
						console.log(body);
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if(body == "Your card's security code is incorrect.")
					{
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Incorrect CCV'
						});
						console.log(`[${task.taskID}] ` + ' Card declined');
						console.log(body);
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					} else if(body == '"Entry successfully finalized"')
					{
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
					else
					{
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Unknown error. DM Log'
						});
						console.log(body);
						return;
					}
				}
			});
		}
		else
		{
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Unknown error. DM Log'
			});
			console.log(body);
			return;
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
			return 'United Kingdom';
			break;
		case 'United States':
			return 'United States';
			break;
		case 'Canada':
			return 'Canada';
			break;
		case 'North Ireland':
			return 'Ireland';
			break;
		case 'Ireland':
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
		case 'Australia':
			return 'Australia';
			break;
		case 'Austria':
			return 'Austria';
			break;
		case 'Slovakia':
			return 'Slovakia';
			break;
		case 'Belgium':
			return 'Belgium';
			break;
		case 'Slovenia':
			return 'Slovenia';
			break;
		case 'Singapore':
			return 'Singapore';
			break;
		case 'Malaysia':
			return 'Malaysia';
			break;
		case 'Hong Kong':
			return 'Hong Kong';
			break;
		case 'China':
			return 'China';
			break;
		case 'Japan':
			return 'Japan';
			break;
		case 'Sweden':
			return 'Sweden';
			break;
		case 'Denmark':
			return 'Denmark';
			break;
		case 'Finland':
			return 'Finland';
			break;
		case 'Romania':
			return 'Romania';
			break;
	}
}





// Random birthday
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}