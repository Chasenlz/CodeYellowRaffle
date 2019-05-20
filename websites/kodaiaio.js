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
var cheerio = require('cheerio');

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
		message: 'Obtaining raffle page'
	});
	request({
		url: task['variant'],
		headers: {
			'authority': 'raffles.kodai.io',
			'cache-control': 'max-age=0',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Awaiting captcha'
			});
			console.log(`[${task.taskID}] ` + ' Awaiting captcha');
			mainBot.requestCaptcha('kodaiaio', task, false);
			const capHandler = () => {
				if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
					setTimeout(() => capHandler(), 100);
				} else {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Submitting entry'
					});

					request({
						url: 'https://raffles.kodai.io/api/raffles/submitEntry',
						method: 'POST',
						headers: {
							'origin': 'https://raffles.kodai.io',
							'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
							'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
							'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
							'accept': '*/*',
							'referer': task['variant'],
							'authority': 'raffles.kodai.io',
							'x-requested-with': 'XMLHttpRequest'
						},
						body: '{"social":"N/A","raffle_id":"O4ONPXW7RVVJTQ","email_address":"' + task['taskEmail'] + '","g-recaptcha-response":"' + mainBot.taskCaptchas[task['type']][task['taskID']] + '"}',
						agent: agent
					}, function callback(error, response, body) {
						if (!error) {
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
								mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
								return;
							}
							if(parsed.success == true)
							{
								mainBot.mainBotWin.send('taskUpdate', {
									id: task.taskID,
									type: task.type,
									message: 'Entry submitted!'
								});
								console.log(`[${task.taskID}] ` + ' Entry submitted!');
								registerEmail(task);
								mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', ''); 
								mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
								return;
							}
							else
							{
								if(parsed.message == 'already entered raffle.')
								{
									mainBot.mainBotWin.send('taskUpdate', {
										id: task.taskID,
										type: task.type,
										message: 'Email already entered'
									});	
									return;
								}
								else
								{
									mainBot.mainBotWin.send('taskUpdate', {
										id: task.taskID,
										type: task.type,
										message: 'Unknown error. DM log'
									});	
									console.log(`[${task.taskID}] ` + JSON.stringify(task));
									console.log(`[${task.taskID}] ` + JSON.stringify(profile));
									console.log(`[${task.taskID}] ` + body);
									return;
								}
							}

						}
						else
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
					});
					return;
				}
			}
			capHandler();
		}
		else
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
	});

}



exports.submitRaffle = function (request, task, profile, urlToPost) {
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
	var form = JSON.parse(
		`{
			"${task['supplystore']['firstName']}": "${profile['firstName']}",
			"${task['supplystore']['lastName']}": "${profile['lastName']}",
			"${task['supplystore']['email']}": "${task['taskEmail']}",
			"${task['supplystore']['phoneNumber']}": "${profile['phoneNumber']}",
			"${task['supplystore']['size']}": "${task['taskSizeSelect']}",
			"${task['supplystore']['street']}": "${profile['address']}",
			"${task['supplystore']['suburbTown']}": "${profile['city']}",
			"${task['supplystore']['state']}": "${profile['stateProvince']}",
			"${task['supplystore']['country']}": "${profile['country']}",
			"${task['supplystore']['postCode']}": "${profile['zipCode']}",
			"cm-privacy-consent": "on",
			"cm-privacy-consent-hidden": "true",
			"cm-privacy-email": "on",
			"cm-privacy-email-hidden": "true",
			"terms": "Yes",
			"cm-f-djihluid": "Yes",
			"terms": "Yes",
			"g-recaptcha-response": "skip"
		}`);
	request({
		url: urlToPost,
		method: 'POST',
		headers: {
			'authority': 'www.createsend.com',
			'cache-control': 'max-age=0',
			'origin': 'https://www.supplystore.com.au',
			'upgrade-insecure-requests': '1',
			'content-type': 'application/x-www-form-urlencoded',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'referer': task['variant'],
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		formData: form,
		agent: agent,
		followAllRedirects: true
	}, function callback(error, response, body) {
		console.log(JSON.stringify(form));
		console.log(`[${task.taskID}] ` + response.request.href);
		if (response.request.href == urlToPost) {
			$ = cheerio.load(body);
			var guid = $('input[name="guid"]').attr('value');
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Awaiting captcha'
			});
			console.log(`[${task.taskID}] ` + ' Awaiting captcha');
			console.log(`[${task.taskID}] ` + 'guid: ' + guid)
			mainBot.requestCaptcha('supplystore', task, false);
			const capHandler = () => {
				if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
					setTimeout(() => capHandler(), 100);
				} else {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Posting captcha'
					});
					request({
						url: 'https://www.createsend.com/t/processrecaptcha',
						method: 'POST',
						headers: {
							'authority': 'www.createsend.com',
							'cache-control': 'max-age=0',
							'origin': 'https://www.createsend.com',
							'upgrade-insecure-requests': '1',
							'content-type': 'application/x-www-form-urlencoded',
							'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
							'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
							'referer': urlToPost,
							'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
						},
						agent: agent,
						followAllRedirects: true,
						formData: {
							'guid': guid,
							'g-recaptcha-response': mainBot.taskCaptchas[task['type']][task['taskID']]

						}
					}, function callback(error, response, body) {
						if (response.request.href == 'https://www.supplystore.com.au/raffles-confirm-your-email-address.aspx' && response.statusCode == 200 && !error) {
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Check Email!'
							});
							console.log(`[${task.taskID}] ` + ' Entry submitted!');
							registerEmail(task);
							mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '');
							mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
							return;
						} else {
							mainBot.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								type: task.type,
								message: 'Error submitting entry'
							});
							console.log(`[${task.taskID}] ` + 'Error submitting entry');
							console.log(`[${task.taskID}] ` + JSON.stringify(task));
							console.log(`[${task.taskID}] ` + JSON.stringify(profile));
							console.log(`[${task.taskID}] ` + body);
							console.log(`[${task.taskID}] ` + response.request.href);
							console.log(`[${task.taskID}] ` + response.statusCode)
							mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
							return;
						}
					});
					return;
				}
			}
			capHandler();
		} else if (response.request.href == 'https://www.supplystore.com.au/raffles-confirm-your-email-address.aspx') {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Check Email!'
			});
			console.log(`[${task.taskID}] ` + ' Entry submitted!');
			registerEmail(task);
			mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], '', '');
			mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
			return;
		}
	});


}


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