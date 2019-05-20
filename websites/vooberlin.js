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
var faker = require('faker');

function formatProxy(proxy)
{
	if(proxy == '')
	{
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

	if(task['proxy'] != '')
	{
		var agent = new HttpsProxyAgent(formatProxy(task['proxy']));
	}
	else
	{
		agent = '';
	}
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
		agent: agent
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
			console.log(`[${task.taskID}] ` + ' Got raffle page');
			$ = cheerio.load(body);
			var raffleToken = $('input[name="token"]').attr('value');
			var pageID = $('input[name="page_id"]').attr('value');
			if (raffleToken == undefined || pageID == undefined) {
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Raffle not found'
				});
				console.log(`[${task.taskID}] ` + ' Raffle not found');
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
			console.log('Got raffle token: ' + raffleToken);
			console.log('Got page ID: ' + pageID);
			console.log('Now needs captcha');
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				type: task.type,
				message: 'Awaiting captcha'
			});
			console.log(`[${task.taskID}] ` + ' Awaiting captcha');
			mainBot.requestCaptcha('vooberlin', task, false);
			const capHandler = () => {
				if (mainBot.taskCaptchas[task['type']][task['taskID']] == undefined || mainBot.taskCaptchas[task['type']][task['taskID']] == '') {
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
		body: 'token=' + raffleToken + '&page_id=' + pageID + '&shoes_size='+sizeFormatter(task['taskSizeSelect'])+'&action=send_request&fax=&name='+profile['firstName']+'&lastname='+profile['lastName']+'&email='+task['taskEmail']+'&contact_number='+profile['phoneNumber']+'&streetname='+profile['address']+'&housenumber='+profile['address']+'&postalcode='+profile['zipCode']+'&city='+profile['city']+'&country='+countryFormatter(profile['country'])+'&countryhidden=&g-recaptcha-response=' + mainBot.taskCaptchas[task['type']][task['taskID']],
		agent: agent
	}, function callback(error, response, body) {
		console.log(`[${task.taskID}]  ` + body)
		body = JSON.parse(body);
		console.log('token=' + raffleToken + '&page_id=' + pageID + '&shoes_size='+sizeFormatter(task['taskSizeSelect'])+'&action=send_request&fax=&name='+profile['firstName']+'&lastname='+profile['lastName']+'&email='+task['taskEmail']+'&contact_number='+profile['phoneNumber']+'&streetname='+profile['address']+'&housenumber='+profile['address']+'&postalcode='+profile['zipCode']+'&city='+profile['city']+'&country='+countryFormatter(profile['country'])+'&countryhidden=&g-recaptcha-response=' + mainBot.taskCaptchas[task['type']][task['taskID']]);
		if(body.error == true)
		{
			console.log(`[${task.taskID}] ` + ' ERROR: ' + body.msg);
			if(body.msg == 'Error Captcha!')
			{
				mainBot.taskCaptchas[task['type']][task['taskID']] = '';
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Captcha error! Retrying'
				});
				console.log(`[${task.taskID}] ` + ' Captcha error! Retrying');
				return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); // REPLACE 3000 WITH RETRY DELAY
			}
			else if(body.msg == 'You can register only once per raffle!')
			{
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Already entered!'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
			else if(body.msg == 'Invalid shoes size!')
			{
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Size error. Contact the devs'
				});
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
			else if(body.msg == 'Required fields are empty!')
			{
				mainBot.mainBotWin.send('taskUpdate', {
					id: task.taskID,
					type: task.type,
					message: 'Please enter every address detail'
				});
				console.log(`[${task.taskID}] ` + JSON.stringify(profile));
				mainBot.taskStatuses[task['type']][task.taskID] = 'idle';
				return;
			}
		}
		else
		{
			mainBot.taskCaptchas[task['type']][task['taskID']]
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
			return 'North Ireland';
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
	}
}

function sizeFormatter(taskSize) {
	switch (taskSize) {
		case '4':
			return '64';
			break;
		case '4.5':
			return '79';
			break;
		case '5':
			return '80';
			break;
		case '5.5':
			return '61';
			break;
		case '6':
			return '81';
			break;
		case '6.5':
			return '82';
			break;
		case '7':
			return '58';
			break;
		case '7.5':
			return '65';
			break;
		case '8':
			return '66';
			break;
		case '8.5':
			return '67';
			break;
		case '9':
			return '68';
			break;
		case '9.5':
			return '69';
			break;
		case '10':
			return '83';
			break;
		case '10.5':
			return '84';
			break;
		case '11':
			return '85';
			break;
		case '11.5':
			return '86';
			break;
		case '12':
			return '87';
			break;
	}
}
