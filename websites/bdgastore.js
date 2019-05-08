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
const faker = require('faker');
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

	if (profile['jigProfileAddress'] == true) {
		profile['aptSuite'] = faker.fake("{{address.secondaryAddress}}");
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
			'Connection': 'keep-alive',
			'Cache-Control': 'max-age=0',
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle page'
			});
			console.log(`[${task.taskID}] ` + ' Got raffle page');
			console.log('Now needs captcha');
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Awaiting captcha'
			});
			console.log(`[${task.taskID}] ` + ' Awaiting captcha');
			mainBot.requestCaptcha('bdgastore', task, false);
			const capHandler = () => {
				if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
					setTimeout(() => capHandler(), 100);
				} else {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Posting raffle information'
					});
					exports.submitRaffle(request, task, profile);
					return;
				}
			}
			capHandler();
		}
		else
		{
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay);
		}
	});
}

exports.submitRaffle = function (request, task, profile) {
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
	if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
		// NEEDS CAPTCHA AGAIN
		return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
	}
	
	if(task['proxy'] != '')
	{
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	}
	else
	{
		agent = '';
	}

	request({
		url: 'https://app.viralsweep.com/promo/enter',
		method: 'POST',
		headers: {
			'origin': 'https://app.viralsweep.com',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'accept': '*/*',
			'referer': 'https://app.viralsweep.com/vrlswp/widget/08441d-51456?rndid=51456_194287&framed=1&ref=&source_url=https%3A%2F%2Fbdgastore.com%2Fblogs%2Fupcoming-releases%2F5-11-19-air-jordan-1-x-travis-scott&hash=',
			'authority': 'app.viralsweep.com',
			'x-requested-with': 'XMLHttpRequest'
		},
		formData: {
			'id': '08441d-51456',
			'type': 'widget',
			'refer_source': '',
			'entry_source': task['variant'],
			'first_name': profile['firstName'],
			'last_name': profile['lastName'],
			'email': task['taskEmail'],
			'email_again': '',
			'37209_1542160709': task['taskSizeSelect'],
			'agree_to_rules': 'yes',
			'g-recaptcha-response': mainBot.taskCaptchas[task['type']][task['taskID']]
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(`[${task.taskID}] ` + body);
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
			if (parsed.success == 1) {
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
			} else {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Unknown Error!'
				});
				console.log(`[${task.taskID}] ` + ' Unknown Error!');
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
		}
		else
		{
			
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			// Goes back to beginning since only 2 steps and re needs captcha probably
			return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay);
		}
	});
	/*request({
		url: 'https://wishatl.us12.list-manage.com/subscribe/confirm-captcha',
		method: 'POST',
		headers: {
			'authority': 'wishatl.us12.list-manage.com',
			'cache-control': 'max-age=0',
			'origin': 'https://wishatl.us12.list-manage.com',
			'upgrade-insecure-requests': '1',
			'content-type': 'application/x-www-form-urlencoded',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,**;q=0.8,application/signed-exchange;v=b3',
			'referer': 'https://wishatl.us12.list-manage.com/subscribe/post',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
		},
		formData: {
			'u': task['variant'].split('?u=')[1].split('&')[0],
			'id': task['variant'].split('&id=')[1],
			'mf': mf,
			'g-recaptcha-response': mainBot.taskCaptchas[task['type']][task['taskID']],
			'recaptcha_response_field': 'manual_challenge'
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			var error2 = $('.errorText').html();
			if(error2)
			{
				if(error2 == 'Captcha failed. Please try again.')
				{
					mainBot.taskCaptchas[task['type']][task['taskID']] = '';
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Captcha error! Retrying'
					});
					console.log(`[${task.taskID}] ` + ' Captcha error! Retrying');
					return setTimeout(() => exports.postRaffleInfo(request, task, profile, token), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
				}
				else
				{
					if(error2.toLowerCase().indexOf('already entered') !== -1)
					{
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Unknown error. Contact the devs (444)'
						});
						console.log(`[${task.taskID}] ` + ' Error: ' + error2)
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					}
					else
					{				
						mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							type: task.type,
							message: 'Already entered!'
						});
						mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
						return;
					}
				}
			}
			var header = $('#templateBody h2').html();
			if(header.toLowerCase().indexOf('subscription confirmed') !== -1)
			{
				var manageEntryURl = $('.formEmailButton').first().next().next().attr('href');
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Entry submitted!'
				});
				console.log(`[${task.taskID}] ` + ' Entry submitted!');
				registerEmail(task);
				mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], manageEntryURl, ''); 
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
			else
			{			
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Unknown Error!'
				});
				console.log(`[${task.taskID}] ` + ' Unknown Error!');
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
		}
		else
		{
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			console.log('New proxy: ' + formatProxy(task['proxy']));
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.submitRaffle(request, task, profile, token, mf), global.settings.retryDelay);
		}
	});*/
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
			return '262';
			break;
		case 'United States':
			return '164';
			break;
		case 'Canada':
			return '30';
			break;
		case 'North Ireland':
			return '74';
			break;
		case 'Ireland':
			return '74';
			break;
		case 'Germany':
			return '59';
			break;
		case 'Switzerland':
			return '149';
			break;
		case 'France':
			return '54';
			break;
		case 'Spain':
			return '143';
			break;
		case 'Italy':
			return '76';
			break;
		case 'Netherlands':
			return '109';
			break;
		case 'Czech Republic':
			return '42';
			break;
		case 'Australia':
			return '8';
			break;
		case 'Belgium':
			return '16';
			break;
		case 'Slovenia':
			return '139';
			break;
		case 'Singapore':
			return '137';
			break;
		case 'Malaysia':
			return '96';
			break;
		case 'Hong Kong':
			return '67';
			break;
		case 'China':
			return '36';
			break;
		case 'Japan':
			return '78';
			break;
	}
}