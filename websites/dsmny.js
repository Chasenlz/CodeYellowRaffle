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
			'Referer': task['dsmny']['mainLink'],
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
		},
		agent: agent
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle endpoint'
			});
			console.log(`[${task.taskID}] ` + ' Got raffle endpoint');
			var split = body.split(';');
			for(var i = 0; i < split.length; i++)
			{
				if(split[i].includes('viewkey'))
				{
					var value = split[i].split('value=')[1];
					var viewkey = value.split('"')[1].replace('\\', '');
				}
				if(split[i].includes('unique_key'))
				{
					var value = split[i].split('value=')[1];
					var uniqueKey = value.split('"')[1].replace('\\', '');
				}
			}
			if(!uniqueKey || !viewkey)
			{
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Error getting raffle tokens. Retrying in ' + global.settings.retryDelay / 1000 + 's'
				});
				console.log(`[${task.taskID}] ` + ' Error getting raffle tokens. Retrying');
				return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay);
			}
			
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle information'
			});
			console.log(`[${task.taskID}] ` + ' Got raffle information');
			console.log('Now needs captcha');
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Awaiting captcha'
			});
			console.log(`[${task.taskID}] ` + ' Awaiting captcha');
			mainBot.requestCaptcha('dsmny', task, false);
			const capHandler = () => {
				if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
					setTimeout(() => capHandler(), 100);
				} else {
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Posting raffle information'
					});
					exports.submitRaffle(request, task, profile, viewkey, uniqueKey);
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

exports.submitRaffle = function (request, task, profile, viewkey, uniqueKey) {
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

	if (task['dsmny']['colorRequired'] == false) {
		var form = JSON.parse(
			` { 
					"form": "${task['dsmny']['form']}",
					"viewkey": "${viewkey}",
					"unique_key": "${uniqueKey}",
					"password": "",
					"hidden_fields": "",
					"incomplete": "",
					"incomplete_password": "",
					"referrer": "${task['dsmny']['mainLink']}",
					"referrer_type": "js",
					"_submit": "1",
					"viewparam": "${task['dsmny']['viewParam']}",
					"style_version": "3",
					"${task['dsmny']['firstName']}": "${profile['firstName']} ${profile['lastName']}",
					"${task['dsmny']['email']}": "${task['taskEmail']}",
					"${task['dsmny']['phoneNumber']}": "${profile['phoneNumber']}",
					"${task['dsmny']['zipCode']}": "${profile['zipCode']}",
					"${task['dsmny']['size']}": "${task['taskSizeSelect']}",
					"g-recaptcha-response": "${mainBot.taskCaptchas[task['type']][task['taskID']]}"
			  }`);
	}
	else
	{
		var form = JSON.parse(
			` { 
					"form": "${task['dsmny']['form']}",
					"viewkey": "${viewkey}",
					"unique_key": "${uniqueKey}",
					"password": "",
					"hidden_fields": "",
					"incomplete": "",
					"incomplete_password": "",
					"referrer": "${task['dsmny']['mainLink']}",
					"referrer_type": "js",
					"_submit": "1",
					"viewparam": "${task['dsmny']['viewParam']}",
					"style_version": "3",
					"${task['dsmny']['firstName']}": "${profile['firstName']} ${profile['lastName']}",
					"${task['dsmny']['email']}": "${task['taskEmail']}",
					"${task['dsmny']['phoneNumber']}": "${profile['phoneNumber']}",
					"${task['dsmny']['zipCode']}": "${profile['zipCode']}",
					"${task['dsmny']['color']}": "${task['dsmny']['colorInput']}",
					"${task['dsmny']['size']}": "${task['taskSizeSelect']}",
					"g-recaptcha-response": "${mainBot.taskCaptchas[task['type']][task['taskID']]}"
			  }`);
	}

	console.log(JSON.stringify(form));

	request({
			url: 'https://doverstreetmarketinternational.formstack.com/forms/index.php',
			method: 'POST',
			headers: {
				'authority': 'doverstreetmarketinternational.formstack.com',
				'cache-control': 'max-age=0',
				'origin': 'https://newyork.doverstreetmarket.com',
				'upgrade-insecure-requests': '1',
				'content-type': 'application/x-www-form-urlencoded',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
				'referer': task['dsmny']['mainLink'],
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
			},
			formData: form,
			followAllRedirects: true,
			agent: agent
		}, function callback(error, response, body) {
			$ = cheerio.load(body)
			var errorText = $('#error').html();
			if(response.request.href == 'https://doverstreetmarketinternational.formstack.com/forms/index.php' || errorText)
			{
				if(errorText.toLowerCase().includes('unique value'))
				{
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'Details already entered'
					});	
					console.log(`[${task.taskID}] ` + JSON.stringify(task));
					console.log(`[${task.taskID}] ` + JSON.stringify(profile));
					console.log(`[${task.taskID}] ` + body);
					return;
				}
				else
				{
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						type: task.type,
						message: 'One of your inputs are invalid (most likely profile)'
					});	
					console.log(`[${task.taskID}] ` + JSON.stringify(task));
					console.log(`[${task.taskID}] ` + JSON.stringify(profile));
					console.log(`[${task.taskID}] ` + body);
					mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
					return;
				}
				
			}
			if(response.request.href == task['dsmny']['thankYouLink'] && response.statusCode == 200)
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
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Unknown error. Probably rate limited'
				});	
				console.log(`[${task.taskID}] ` + JSON.stringify(task));
				console.log(`[${task.taskID}] ` + JSON.stringify(profile));
				console.log(`[${task.taskID}] ` + body);
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
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
