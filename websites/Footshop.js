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

function getRandomProxy() {
	return '';
}

exports.performTask = function (task, profile) {
	var jar = require('request').jar()
	var request = require('request').defaults({
		jar: jar
	});
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
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
		}
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			var parsed = JSON.parse(body);
			var sizes = parsed['sizeSets']['Unisex']['sizes'];
			for(var i = 0; i < sizes.length; i++)
			{
				if(sizes[i]['us'] == task['taskSizeSelect'])
				{
					var sizeID = sizes[i]['id'];
					console.log('Got Size ID : ' + sizeID);
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						message: 'GOT SIZE ID'
					});			
					exports.getRaffle(request, task, profile, sizeID);
				}
			}
		}
		else
		{
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.performTask(task, profile), global.settings.retryDelay); 
		}
	});


}


exports.getRaffle = function (request, task, profile, sizeID) {
	var raffleURL = 'https://releases.footshop.com/register/'+task['variant']+'/Unisex/'+ sizeID;
	mainBot.mainBotWin.send('taskUpdate', {
		id: task.taskID,
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
		}
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('Got raffle page');
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
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
				json: true
			}, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					
					console.log(body);
					if (body.email == true) {
						console.log('Email used before');
						return mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							message: 'Email previously entered'
						});
					}
					else if (body.phone == true) {
						console.log('Phone number used before');
						return mainBot.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							message: 'Phone number previously entered'
						});
					} else {
						exports.submitRaffle(request, task, profile, sizeID)
					}
				}
				else
				{
					var proxy2 = getRandomProxy();
					task['proxy'] = proxy2;
					mainBot.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
					});
					return setTimeout(() => exports.getRaffle(request, task, profile, sizeID), global.settings.retryDelay); 
				}
			});
		}
		else
		{
			var proxy2 = getRandomProxy();
			task['proxy'] = proxy2;
			mainBot.mainBotWin.send('taskUpdate', {
				id: task.taskID,
				message: 'Error. Retrying in ' + global.settings.retryDelay / 1000 + 's'
			});
			return setTimeout(() => exports.getRaffle(request, task, profile, sizeID), global.settings.retryDelay); 
		}
	});
}


exports.submitRaffle = function (request, task, profile, sizeID) {

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
			expiryYear: profile['expiryYear'].substr(profiles["Example Profile"]['expiryYear'].length - 2),
			cvv: profile['CVV'],
			requestSource: 'JS'
		},
		json: true
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var cardToken = body['id'];
			console.log(cardToken + ' Card token received');
                            var options = {
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
                                    'referer': 'https://releases.footshop.com/register/'+task['variant']+'/Unisex/'+ sizeID
                                },
                                body: {
                                    "id": null,
                                    "sizerunId": sizeID,
                                    "account": "New Customer",
                                    "email": task['taskEmail'],
                                    "phone": profile['phoneNumber'],
                                    "gender": "Mr",
                                    "firstName": profile['fullName'].split(" ")[0],
                                    "lastName": profile['fullName'].split(" ")[1],
                                    "birthday": `${getRandomInt(1982, 2000)}-0${getRandomInt(1, 9)}-0${getRandomInt(1, 9)}`, 
                                    "deliveryAddress": {
                                        "country": countryFormatter(profile['country']),
                                        "state": "",
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
                                json: true
                            };
                            request(options, function callback(error, response, body) {
                                console.log(body);
                                // open this page to complete payment body['secure3DRedirectUrl']
                            });
                        
		}
	});
}




// Needed for country localizations being different per site
function countryFormatter(profileCountry)
{
	switch(profileCountry)
	{
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
	}
}





// Random birthday
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}