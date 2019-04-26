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

function formatProxy(proxy)
{
	if(proxy == '')
	{
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
			'authority': 'raffle.vooberlin.com',
			'cache-control': 'max-age=0',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
		},
		proxy: formatProxy(task['proxy']),
	}, function (error, response, body) {
		if (error) {
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;			
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
		if (response.statusCode == 200) {
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Got raffle page'
			});
			console.log('Got raffle page');
			$ = cheerio.load(body);
			var raffleToken = $('input[name="token"]').attr('value');
			var pageID = $('input[name="page_id"]').attr('value');
			if (raffleToken == undefined || pageID == undefined) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
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
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
		}
	});
}




exports.submitRaffle = function (request, task, profile, raffleToken, pageID) {
	if(checkEmail(task))
	{
		mainBot.mainBotWin.send('taskUpdate', {
			id: task.taskID,
			type: task.type,
			message: 'Email previously entered'
		});
		return;
	}
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
		body: 'token=' + raffleToken + '&page_id=' + pageID + '&shoes_size=69&action=send_request&fax=&name='+profile['firstName']+'&lastname='+profile['lastName']+'&email='+task['taskEmail']+'&contact_number='+profile['phoneNumber']+'&streetname='+profile['address']+'&housenumber='+profile['address']+'&postalcode='+profile['zipCode']+'&city='+profile['city']+'&country='+countryFormatter(profile['country'])+'&countryhidden=&g-recaptcha-response=' + mainBot.taskCaptchas[task['taskID']],
		proxy: formatProxy(task['proxy'])
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
					type: task.type,
					message: 'Captcha error! Retrying'
				});
				return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
			}
			else if(body.msg == 'You can register only once per raffle!')
			{
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
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
				type: task.type,
				message: 'Entry submitted!'
			});
			registerEmail(task);
			mainBot.sendWebhook(task['taskSiteSelect'], task['taskEmail'], ''); 
			return;
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


// Needed for country localizations being different per site
function countryFormatter(profileCountry)
{
	switch(profileCountry)
	{
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