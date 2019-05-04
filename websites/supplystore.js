var jar = require('request').jar()
var cheerio = require('cheerio');
var request = require('request').defaults({
	jar: jar
});

var variant = 'https://www.supplystore.com.au/raffle-nike-x-clot-air-max-haven-voltdark-grey-pure-platinum.aspx';

console.log('Getting raffle page');
request({
    url: variant,
    headers: {
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Upgrade-Insecure-Requests': '1',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
		'Referer': 'https://www.supplystore.com.au/raffles.aspx',
		'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
	}
}, function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
		$ = cheerio.load(body);
		console.log('Got raffle page');
		var raffleToken = $('#raffleForm').attr('data-id');
        console.log('Raffle token: ' + raffleToken);
		request({
			url: 'https://createsend.com//t/getsecuresubscribelink',
			method: 'POST',
			headers: {
				'Referer': variant,
				'Origin': 'https://www.supplystore.com.au',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
				'Content-type': 'application/x-www-form-urlencoded'
			},
			formData: { 'email': 'abrarlone01@outlook.com', 'data': raffleToken }
		}, function callback(error, response, body) {
			if (!error && response.statusCode == 200) {
				var submitURL = body;
				console.log('Submitting raffle to: ' + submitURL);	
				// Needs captcha here
				request({
					url: submitURL,
					method: 'POST',
					headers: {
						'authority': 'www.createsend.com',
						'cache-control': 'max-age=0',
						'origin': 'https://www.supplystore.com.au',
						'upgrade-insecure-requests': '1',
						'content-type': 'application/x-www-form-urlencoded',
						'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
						'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
						'referer': variant,
						'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
					},
					formData: { 'cm-f-djiidyhy': 'fname',
								'cm-f-djiidyhj': 'lname',
								'cm-ojudktu-ojudktu': 'email@gmail.com',
								'cm-f-djiidyhi': 'number',
								'cm-fo-djiidjf': '14060892',
								'cm-f-djiidyht': 'street',
								'cm-f-djiidyhd': 'town',
								'cm-f-djiidyhh': 'state',
								'cm-f-djiidyhk': 'country',
								'cm-f-djiidyhu': 'post code',
								'cm-privacy-consent': 'on',
								'cm-privacy-consent-hidden': 'true',
								'cm-privacy-email': 'on',
								'cm-privacy-email-hidden': 'true',
								'terms': 'Yes',
								'cm-f-djiidykl': 'Yes',
								'terms': 'Yes',
								'g-recaptcha-response': '03AOLTBLSHxdFjUQwCygIYtl0SJVixGk_7QiKZVr7UbSNH1_HF28VeqxbC_JiDAOn7nxjwAOhCI91gYAxNBvBU-g8nY-MtlQtkIBP0hsTsKMS7pC0PmApnh92AwRqsJ5FO5yj_HnQKHNBOlt07v9kE4DRmD_CqVYgWh54JaQbNAAegvqaQg_NzUmx4UMCdP81bv-qg1TnteyjI7PxEoJ3TLnbq3iQX8lFICf7-ijopatoIl0fOPUOUKqU8U0s6aNE41pHiN9PfY5aaMFdDG3N28UhM2vJmHwEMGrwRvZN5yh8zSi9oa2YXdh4yL4CfhQxk_k6AEWi_jJPz'
							   }
				}, function callback(error, response, body) {
						console.log(body);
				});

			}
		});

    }
});
