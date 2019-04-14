var jar = require('request').jar()
var request = require('request').defaults({
    jar: jar
});

var email = 'abrarl2ob501@outlook.com';
var phone = '0756653495082';


request({
    url: 'https://releases.footshop.com/register/Y9GFSGkBE08eLkdb1ZYd/Unisex/7600364c-3e79-11e9-b860-0242ac130003',
    headers: {
        'authority': 'releases.footshop.com',
        'cache-control': 'max-age=0',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
    }
}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        request({
            url: 'https://releases.footshop.com/api/registrations/check-duplicity/Y9GFSGkBE08eLkdb1ZYd',
            method: 'POST',
            headers: {
                'origin': 'https://releases.footshop.com',
                'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
                'content-type': 'application/json;charset=UTF-8',
                'accept': 'application/json, text/plain, */*',
                'cache-control': 'no-cache',
                'authority': 'releases.footshop.com',
                'referer': 'https://releases.footshop.com/register/Y9GFSGkBE08eLkdb1ZYd/Unisex/7600364c-3e79-11e9-b860-0242ac130003'
            },
            body: {
                email: email,
                phone: phone,
                id: null
            },
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if (body.email == true) {
                    console.log('Email used before');
                } else if (body.phone == true) {
                    console.log('Phone number used before');
                } else {
                    var request = require('request');
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
                            number: '4242424242424242',
                            expiryMonth: '08',
                            expiryYear: '21',
                            cvv: '350',
                            requestSource: 'JS'
                        },
                        json: true
                    }, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var cardToken = body['id'];
                            console.log(cardToken + ' Card token received');
                            var options = {
                                url: 'https://releases.footshop.com/api/registrations/create/Y9GFSGkBE08eLkdb1ZYd',
                                method: 'POST',
                                headers: {
                                    'origin': 'https://releases.footshop.com',
                                    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
                                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
                                    'content-type': 'application/json;charset=UTF-8',
                                    'accept': 'application/json, text/plain, */*',
                                    'cache-control': 'no-cache',
                                    'authority': 'releases.footshop.com',
                                    'referer': 'https://releases.footshop.com/register/Y9GFSGkBE08eLkdb1ZYd/Unisex/7600364c-3e79-11e9-b860-0242ac130003'
                                },
                                body: {
                                    "id": null,
                                    "sizerunId": "7600364c-3e79-11e9-b860-0242ac130003",
                                    "account": "New Customer",
                                    "email": email,
                                    "phone": phone,
                                    "gender": "Mr",
                                    "firstName": "Abrar",
                                    "lastName": "Lone",
                                    "birthday": "1996-09-09",
                                    "deliveryAddress": {
                                        "country": "GB",
                                        "state": "",
                                        "county": "",
                                        "city": "Bristol",
                                        "street": "Marshfield Road",
                                        "houseNumber": "53",
                                        "additional": "",
                                        "postalCode": "BS16 4BG"
                                    },
                                    "consents": ["privacy-policy-101"],
                                    "cardToken": cardToken,
                                    "cardLast4": "9172"
                                },
                                json: true
                            };
                            request(options, function callback(error, response, body) {
                                console.log(t['secure3DRedirectUrl']);
                                // open this page to complete payment
                            });
                        }
                    });

                }
            }
        });

    }

});