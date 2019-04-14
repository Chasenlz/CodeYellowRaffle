var mainBot = require('../index.js')
var cheerio = require('cheerio');
var userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';
// REPLACE 3000 WITH RETRY DELAY// REPLACE 3000 WITH RETRY DELAY// REPLACE 3000 WITH RETRY DELAY// REPLACE 3000 WITH RETRY DELAY
// REPLACE 3000 WITH RETRY DELAY// REPLACE 3000 WITH RETRY DELAY// REPLACE 3000 WITH RETRY DELAY// REPLACE 3000 WITH RETRY DELAY
function getRandomProxy()
{
    return '';
}

exports.performTask = function (task, profile) {
    //////////////////////////////////////////////////////console.log('trying');
	var jar = require('request').jar()
	var request = require('request').defaults({
		jar: jar
	});
	request({
		url: 'https://www.nakedcph.com/auth/view?op=register',
		method: 'GET',
		headers: {
			'authority': 'www.nakedcph.com',
			'upgrade-insecure-requests': '1',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
        },
        followAllRedirects: true,
		proxy: task['proxy'],
	}, function (error, response, body) {
		if (error) {
            var proxy2 = getRandomProxy();
            task['proxy'] = proxy2;
			//////////////////////////////////////////////////////console.log('\x1b[1;33m' + "[] - Error1");
            return setTimeout(() => exports.performTask(task, profile), 3000); // REPLACE 3000 WITH RETRY DELAY
		}
		if (response.statusCode == 200) {
			$ = cheerio.load(body);
			var csrfToken = $('input[name="_AntiCsrfToken"]').attr('value');
			console.log('\x1b[1;33m' + "[] - Got Registration Page");
			//createAccount(taskNum, proxy, request, csrfToken)
		} else {
			var proxy2 = getRandomProxy();
            task['proxy'] = proxy2;
			//////////////////////////////////////////////////////console.log('\x1b[1;33m' + "[] - Error2 " + response.statusCode);
            return setTimeout(() => exports.performTask(task, profile), 3000); // REPLACE 3000 WITH RETRY DELAY
		}
	});
}


exports.init = function (task, profile, quickTask, productSku, sizeSku, styleSku) {
    if (quickTask == true) {
        var jar = require('request').jar();
        var request = require('request').defaults({
            jar: jar,
            headers: {
                'Host': 'www.supremenewyork.com',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'en-us',
                'Origin': 'https://www.supremenewyork.com',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15G77',
                'Referer': 'https://www.supremenewyork.com/mobile',
                'Connection': 'keep-alive'
            },
            gzip: true,
            timeout: 10000
        });
        productURL = `${baseURL}shop/${productSku}`;
        task['itemImage'] = 'https://i.imgur.com/SoAlXAD.png';
        task['taskRegion'] = global.settings.defaultExtensionTaskRegion;
        task['taskATCDelay'] = global.settings.defaultExtensionATCDelay;
        task['taskCheckoutDelay'] = global.settings.defaultExtensionCheckoutDelay;
        task['taskMonitorDelay'] = global.settings.defaultExtensionMonitorDelay
        task['taskRetryDelay'] = global.settings.defaultExtensionRetryDelay;
        // console.log(productURL + ' ' + productSku + ' ' + styleSku + ' ' + sizeSku)
        console.log(profile);
        exports.addToCart(request, task, profile, productURL, productSku, sizeSku, styleSku);
    } else {
        var jar = require('request').jar();
        var request = require('request').defaults({
            jar: jar,
            headers: {
                'Host': 'www.supremenewyork.com',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'en-us',
                'Origin': 'https://www.supremenewyork.com',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15G77',
                'Referer': 'https://www.supremenewyork.com/mobile',
                'Connection': 'keep-alive'
            },
            gzip: true,
            timeout: 10000
        });
        var schedule = require('node-schedule');
        if (task.scheduled == false) {
            exports.monitor(task, profile, request)
        } else {
            var scheduleTime = task.taskSchedule.split(':');
            bank.mainBotWin.send('taskUpdate', {
                id: task.taskID,
                message: `TASK SCHEDULED FOR ${scheduleTime[0]}:${scheduleTime[1]}:${scheduleTime[2]}`
            });
            var j = schedule.scheduleJob({
                hour: scheduleTime[0],
                minute: scheduleTime[1],
                second: scheduleTime[2]
            }, function () {
                exports.monitor(task, profile, request)
                j.cancel();
            });

        }
    }
}

exports.monitor = function (task, profile, request) {
    if (shouldStop(task.taskID) == true) {
        return bank.mainBotWin.send('taskUpdate', {
            id: task.taskID,
            message: 'IDLE'
        });
    }
    console.log('Monitoring' + task.taskKeywords);
	
	if(task.taskKeywords == 'visual')
	{
		visualMonitor.visualMonitor.show();
		bank.mainBotWin.send('taskProgress', {
			id: task.taskid,
			message: 'MONITORING'
		});
		const checkIfFound = () => {
			if (visualMonitor.itemIDToCheckout == 'monitoring') {
				setTimeout(() => checkIfFound(), 50);
			} else 
			{
				var jar = require('request').jar();
				var request = require('request').defaults({
					jar: jar,
					headers: {
						'Host': 'www.supremenewyork.com',
						'Accept': 'application/json',
						'X-Requested-With': 'XMLHttpRequest',
						'Accept-Encoding': 'gzip, deflate',
						'Accept-Language': 'en-us',
						'Origin': 'https://www.supremenewyork.com',
						'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15G77',
						'Referer': 'https://www.supremenewyork.com/mobile',
						'Connection': 'keep-alive'
					},
					gzip: true,
					timeout: 10000
				});
				bank.mainBotWin.send('taskProgress', {
					id: task.taskid,
					message: 'PRODUCT FOUND'
				});
				visualMonitor.visualMonitor.hide();
				productName = visualMonitor.itemIDToCheckout;
				productSku = visualMonitor.itemIDToCheckout;
				productURL = `${baseURL}shop/${productSku}`;
				console.log(`Product link found -> ${productURL}`);
				var start = new Date().getTime();
				return exports.getProductData(request, task, profile, productURL, productSku)
			}
		}
		checkIfFound();
	}
	else
	{
		request.get({
				url: `${baseURL}mobile_stock.json`,
				proxy: '',
			},
			function (error, response, body) {
				if (error) {
					bank.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						message: 'ERROR. RETRYING'
					});
					console.log('monitor error')
					return setTimeout(() => exports.monitor(task, profile, request), task.taskRetryDelay);
				} else if (response.statusCode != 200) {
					bank.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						message: 'FAILED. RETRYING'
					});
					return setTimeout(() => exports.monitor(task, profile, request), task.taskMonitorDelay);
				} else {
					//console.log(task);
					let products = JSON.parse(body)['products_and_categories'];
					let categories = {
						new: products['new'],
						jackets: products['Jackets'],
						tops_sweaters: products['Tops/Sweaters'],
						shirts: products['Shirts'],
						pants: products['Pants'],
						shorts: products['Shorts'],
						sweatShirts: products['Sweatshirts'],
						accessories: products['Accessories'],
						t_shirts: products['T-Shirts'],
						bags: products['Bags'],
						hats: products['Hats']
					};
					let category = task.taskCategory;
					console.log(category);
					bank.mainBotWin.send('taskUpdate', {
						id: task.taskID,
						message: 'GOT PRODUCTS'
					});
					if (!categories[category]) {
						bank.mainBotWin.send('taskUpdate', {
							id: task.taskID,
							message: 'MONITORING'
						});
						return setTimeout(() => exports.monitor(task, profile, request), task.taskMonitorDelay);
					}
					let productName;
					let id;
					for (let i = 0; i <= categories[category].length; i += 1) {
						if (i < categories[category].length) {
							try {
								productName = categories[category][i].name.toLowerCase();
								id = categories[category][i].id;
							} catch (e) {}
							if (productName && id) {
								if (exports.hasKeywords(unidecode(productName), {
										posKeywords: task.taskKeywords.split(','),
										negKeywords: []
									})) {
									bank.mainBotWin.send('taskUpdate', {
										id: task.taskID,
										message: 'PRODUCT FOUND'
									});
									//actions.setProductName.bind(this)(productName);
									productName = productName;
									productSku = id;
									productURL = `${baseURL}shop/${productSku}`;
									console.log(`Product link found -> ${productURL}`);
									return exports.getProductData(request, task, profile, productURL, productSku)
								}
							}
						} else {
							bank.mainBotWin.send('taskUpdate', {
								id: task.taskID,
								message: 'MONITORING'
							}); // NO PRODUCTS FOUND
							return setTimeout(() => exports.monitor(task, profile, request), task.taskMonitorDelay);
						}
					}

				}
			});
	}
}

exports.getProductData = function (request, task, profile, productURL, productSku) {
    if (shouldStop(task.taskID) == true) {
        return bank.mainBotWin.send('taskUpdate', {
            id: task.taskID,
            message: 'IDLE'
        });
    }
    bank.mainBotWin.send('taskUpdate', {
        id: task.taskID,
        message: 'FINDING SIZE'
    });
    console.log('finding size');
    request.get({
            url: `${productURL}.json`,
            proxy: '',
        },
        function (error, response, body) {
            console.log('Got size page');
            if (error) {
                bank.mainBotWin.send('taskUpdate', {
                    id: task.taskID,
                    message: 'ERROR. RETRYING'
                });
                console.log('product data error')
                return setTimeout(() => exports.getProductData(request, task, profile, productURL, productSku), task.taskRetryDelay);
            } else if (response.statusCode != 200) {
                bank.mainBotWin.send('taskUpdate', {
                    id: task.taskID,
                    message: 'FAILED. RETRYING'
                });
                return setTimeout(() => exports.getProductData(request, task, profile, productURL, productSku), task.taskMonitorDelay);
            } else {
                let productData;
                let styleData;
                let styleSku;
                let sizeSku;
                try {
                    productData = JSON.parse(body).styles;
                } catch (e) {}
                if (!productData) {
                    bank.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        message: 'FAILED. RETRYING'
                    });
                    return setTimeout(() => exports.getProductData(request, task, profile, productURL, productSku), task.taskMonitorDelay);
                }
                console.log('Found Product Data');
                var styleRes = exports.hasProductStyle(task, productData);
                styleData = styleRes.styleData;
                styleSku = styleRes.styleSku;
                task['itemImage'] = styleRes.itemImage;
                if (!styleData) {
                    bank.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        message: 'NO STYLE FOUND. RETRYING'
                    });
                    console.log('no style found');
                    return setTimeout(() => exports.getProductData(request, task, profile, productURL, productSku), task.taskMonitorDelay);
                }
                sizeSku = exports.hasProductSize(task, styleData);
                if (!sizeSku) {
                    bank.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        message: 'NO SIZES FOUND. RETRYING'
                    });
                    console.log('no size found');
                    return setTimeout(() => exports.getProductData(request, task, profile, productURL, productSku), task.taskMonitorDelay);
                }
                bank.mainBotWin.send('taskUpdate', {
                    id: task.taskID,
                    message: 'SIZE FOUND'
                });
                console.log('size found');
                bank.mainBotWin.send('taskUpdate', {
                    id: task.taskID,
                    message: `DELAYING ${task.taskATCDelay/1000}S`
                });
                return setTimeout(() => {
                    exports.addToCart(request, task, profile, productURL, productSku, styleSku, sizeSku);
                }, task.taskATCDelay)

            }
        });
}

exports.addToCart = function (request, task, profile, productURL, productSku, styleSku, sizeSku) {
    if (shouldStop(task.taskID) == true) {
        return bank.mainBotWin.send('taskUpdate', {
            id: task.taskID,
            message: 'IDLE'
        });
    }
    bank.mainBotWin.send('taskUpdate', {
        id: task.taskID,
        message: 'ADDING TO CART'
    });
    let form;
    if (task.taskRegion == "supremeus" || task.taskRegion == "supremeca") {
        form = {
            's': sizeSku,
            'st': styleSku,
            'qty': '1'
        };
    } else {
        form = {
            'size': sizeSku,
            'style': styleSku,
            'qty': '1'
        };
    }
    console.log(form);
    request.post({
            url: `${baseURL}shop/${productSku}/add.json`,
            proxy: '',
            form: form
        },
        function (error, response, body) {
            if (error) {
                bank.mainBotWin.send('taskUpdate', {
                    id: task.taskID,
                    message: 'ERROR. RETRYING'
                });
                console.log('atc error')
                setTimeout(() => exports.addToCart(request, task, profile, productURL, productSku, styleSku, sizeSku), task.taskRetryDelay);
            } else if (response.statusCode != 200) {
                bank.mainBotWin.send('taskUpdate', {
                    id: task.taskID,
                    message: 'FAILED. RETRYING'
                });
                setTimeout(() => exports.addToCart(request, task, profile, productURL, productSku, styleSku, sizeSku), task.taskMonitorDelay);
            } else {
                let carted;
                try {
                    carted = JSON.parse(body)[0].in_stock
                } catch (e) {}
                if (!carted) {
                    bank.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        message: 'OOS. RETRYING'
                    });
                    console.log(`OOS. Retrying. url -> ${baseURL}shop/${productSku}/add.json`);
                    return setTimeout(() => exports.addToCart(request, task, profile, productURL, productSku, styleSku, sizeSku), task.taskMonitorDelay);
                }
                let cart;
                let unParsedCart;
                let cookieArray;
                console.log('Cart response: ' + body);
                bank.mainBotWin.send('taskUpdate', {
                    id: task.taskID,
                    message: 'CARTED'
                });
                console.log('carted');
                try {
                    cookieArray = response.headers['set-cookie'];
                    unParsedCart = cookieArray[2].split(';');
                    unParsedCart = unParsedCart[0].replace('pure_cart=', '');
                    cart = unParsedCart.replace(/%/g, '%25');
                } catch (e) {}
                if (!cart || !unParsedCart) {
                    bank.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        message: 'FAILED. RETRYING'
                    });
                    return setTimeout(() => exports.addToCart(request, task, profile, productURL, productSku, styleSku, sizeSku), task.taskRetryDelay);
                }
                spcGet = cart;
                spcPost = unParsedCart;
                // NEED TO GET CAPTCHA HERE
                // NEED TO GET CAPTCHA HERE
                // NEED TO GET CAPTCHA HERE
                // NEED TO GET CAPTCHA HERE
                // NEED TO GET CAPTCHA HERE
                // NEED TO GET CAPTCHA HERE
                // NEED TO GET CAPTCHA HERE
                // NEED TO GET CAPTCHA HERE
                // NEED TO GET CAPTCHA HERE
                exports.getCheckout(request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost)
            }
        });
}

exports.requestCaptcha = function (request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost) {
    if (shouldStop(task.taskID) == true) {
        return bank.mainBotWin.send('taskUpdate', {
            id: task.taskID,
            message: 'IDLE'
        });
    }
    timestamp = Math.floor(Date.now());
    bank.capWin.show();
    bank.capWin.send('captcha requested', {
        timestamp: timestamp
    });
    exports.payLogic(request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost, timestamp);
}

exports.getCheckout = function (request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost) {
    if (shouldStop(task.taskID) == true) {
        return bank.mainBotWin.send('taskUpdate', {
            id: task.taskID,
            message: 'IDLE'
        });
    }
    bank.mainBotWin.send('taskUpdate', {
        id: task.taskID,
        message: 'LOADING CHECKOUT'
    });

    let url;
    if (task.taskRegion == "supremeus") {
        url = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=USA&cookie-sub=${spcGet}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;
    } else if (task.taskRegion == "supremeca") {
        url = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=CANADA&cookie-sub=${spcGet}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;
    } else if(task.taskRegion == 'supremeuk') {
        url = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=GB&cookie-sub=${spcGet}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;
    } else if(task.taskRegion == 'supremede') {
        url = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=DE&cookie-sub=${spcGet}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;
    } else if(task.taskRegion == 'supremefr') {
        url = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=FR&cookie-sub=${spcGet}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;
    } else if(task.taskRegion == 'supremeit') {
        url = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=IT&cookie-sub=${spcGet}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;
    } else if(task.taskRegion == 'supremeni') {
        url = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=NB&cookie-sub=${spcGet}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;
    } else if(task.taskRegion == 'supremesz') {
        url = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=CH&cookie-sub=${spcGet}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;
    } else if(task.taskRegion == 'supremees') {
        url = `https://www.supremenewyork.com/checkout/totals_mobile.js?order%5Bbilling_country%5D=ES&cookie-sub=${spcGet}&order%5Bbilling_state%5D=&order%5Bbilling_zip%5D=&mobile=true`;
    }
    request.get({
            url: url,
            proxy: '',
        },
        function (error, response, body) {
            if (error) {
                bank.mainBotWin.send('taskUpdate', {
                    id: task.taskID,
                    message: 'ERROR. RETRYING'
                });
                setTimeout(() => exports.getCheckout(request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost), task.taskRetryDelay);
            } else {
                bank.mainBotWin.send('taskUpdate', {
                    id: task.taskID,
                    message: `DELAYING ${task.taskCheckoutDelay/1000}S`
                });
                setTimeout(() => {
                    bank.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        message: `AWAITING CAPTCHA`
                    });
                    //exports.submitPayment();
					console.log(`Try Cap Bypass: ${task.capBypass}`);
					if(task.capBypass == true)
					{
						exports.submitPayment(request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost, '');
					}
					else
					{
						exports.requestCaptcha(request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost);
					}
                }, task.taskCheckoutDelay)

            }
        });
}
exports.payLogic = function (request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost, timestamp) {
    if (shouldStop(task.taskID) == true) {
        return bank.mainBotWin.send('taskUpdate', {
            id: task.taskID,
            message: 'IDLE'
        });
    }
    const capManager = () => {
        if (shouldStop(task.taskID) == true) {
            return bank.mainBotWin.send('taskUpdate', {
                id: task.taskID,
                message: 'IDLE'
            });
        }
        if (bank.captchaBank.length === 0) {
            setTimeout(() => capManager(), 50);
        } else {
            for (let i = 0; i < bank.captchaBank.length; i += 1) {
                if (bank.captchaBank[i].timestamp > timestamp) {
                    exports.submitPayment(request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost, bank.captchaBank[i].response);
                    bank.captchaBank.splice(i, 1);
                    return;
                }
            }
        }
    }
    capManager();
}
exports.submitPayment = function (request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost, token) {
    if (shouldStop(task.taskID) == true) {
        return bank.mainBotWin.send('taskUpdate', {
            id: task.taskID,
            message: 'IDLE'
        });
    }
    console.log('proceeding payment');
    let form;
    if (task.taskRegion == "supremeus") {
        form = {
            'from_mobile': '1',
            'cookie-sub': spcPost,
            'same_as_billing_address': '1',
            'order[billing_name]': profile.fullName,
            'order[email]': profile.email,
            'order[tel]': profile.phoneNumber,
            'order[billing_address]': profile.address,
            'order[billing_address_2]': profile.aptSuite,
            'order[billing_zip]': profile.zipCode,
            'order[billing_city]': profile.city,
            'order[billing_state]': profile.stateProvince,
            'order[billing_country]': 'USA',
            'credit_card[cnb]': profile.cardNumber,
            'credit_card[month]': profile.expiryMonth,
            'credit_card[year]': profile.expiryYear,
            'credit_card[rsusr]': profile.CVV,
            'order[terms]': '0',
            'order[terms]': '1',
            'g-recaptcha-response': token,
            'is_from_ios_native': '1'
        };
    } else if (task.taskRegion == "supremeca") {
        form = {
            'from_mobile': '1',
            'cookie-sub': spcPost,
            'same_as_billing_address': '1',
            'order[billing_name]': profile.fullName,
            'order[email]': profile.email,
            'order[tel]': profile.phoneNumber,
            'order[billing_address]': profile.address,
            'order[billing_address_2]': profile.aptSuite,
            'order[billing_zip]': profile.zipCode,
            'order[billing_city]': profile.city,
            'order[billing_state]': profile.stateProvince,
            'order[billing_country]': 'CANADA',
            'credit_card[cnb]': profile.cardNumber,
            'credit_card[month]': profile.expiryMonth,
            'credit_card[year]': profile.expiryYear,
            'credit_card[rsusr]': profile.CVV,
            'order[terms]': '0',
            'order[terms]': '1',
            'g-recaptcha-response': token,
            'is_from_ios_native': '1'
        };
    } else if (task.taskRegion == 'supremeuk') {
        form = {
            'from_mobile': '1',
            'cookie-sub': spcPost,
            'same_as_billing_address': '1',
            'order[billing_name]': profile.fullName,
            'order[email]': profile.email,
            'order[tel]': profile.phoneNumber,
            'order[billing_address]': profile.address,
            'order[billing_address_2]': profile.aptSuite,
            'order[billing_zip]': profile.zipCode,
            'order[billing_city]': profile.city,
            'order[billing_country]': 'GB',
            'credit_card[cnb]': profile.cardNumber,
            'credit_card[month]': profile.expiryMonth,
            'credit_card[year]': profile.expiryYear,
            'credit_card[type]': profile.cardType,
            'credit_card[vval]': profile.CVV,
            'order[terms]': '0',
            'order[terms]': '1',
            'g-recaptcha-response': token,
            'is_from_ios_native': '1'
        };
    } else if (task.taskRegion == 'supremede') {
        form = {
            'from_mobile': '1',
            'cookie-sub': spcPost,
            'same_as_billing_address': '1',
            'order[billing_name]': profile.fullName,
            'order[email]': profile.email,
            'order[tel]': profile.phoneNumber,
            'order[billing_address]': profile.address,
            'order[billing_address_2]': profile.aptSuite,
            'order[billing_zip]': profile.zipCode,
            'order[billing_city]': profile.city,
            'order[billing_country]': 'DE',
            'credit_card[cnb]': profile.cardNumber,
            'credit_card[month]': profile.expiryMonth,
            'credit_card[year]': profile.expiryYear,
            'credit_card[type]': profile.cardType,
            'credit_card[vval]': profile.CVV,
            'order[terms]': '0',
            'order[terms]': '1',
            'g-recaptcha-response': token,
            'is_from_ios_native': '1'
        };
    } else if (task.taskRegion == 'supremefr') {
        form = {
            'from_mobile': '1',
            'cookie-sub': spcPost,
            'same_as_billing_address': '1',
            'order[billing_name]': profile.fullName,
            'order[email]': profile.email,
            'order[tel]': profile.phoneNumber,
            'order[billing_address]': profile.address,
            'order[billing_address_2]': profile.aptSuite,
            'order[billing_zip]': profile.zipCode,
            'order[billing_city]': profile.city,
            'order[billing_country]': 'FR',
            'credit_card[cnb]': profile.cardNumber,
            'credit_card[month]': profile.expiryMonth,
            'credit_card[year]': profile.expiryYear,
            'credit_card[type]': profile.cardType,
            'credit_card[vval]': profile.CVV,
            'order[terms]': '0',
            'order[terms]': '1',
            'g-recaptcha-response': token,
            'is_from_ios_native': '1'
        };
    } else if (task.taskRegion == 'supremeit') {
        form = {
            'from_mobile': '1',
            'cookie-sub': spcPost,
            'same_as_billing_address': '1',
            'order[billing_name]': profile.fullName,
            'order[email]': profile.email,
            'order[tel]': profile.phoneNumber,
            'order[billing_address]': profile.address,
            'order[billing_address_2]': profile.aptSuite,
            'order[billing_zip]': profile.zipCode,
            'order[billing_city]': profile.city,
            'order[billing_country]': 'IT',
            'credit_card[cnb]': profile.cardNumber,
            'credit_card[month]': profile.expiryMonth,
            'credit_card[year]': profile.expiryYear,
            'credit_card[type]': profile.cardType,
            'credit_card[vval]': profile.CVV,
            'order[terms]': '0',
            'order[terms]': '1',
            'g-recaptcha-response': token,
            'is_from_ios_native': '1'
        };
    } else if (task.taskRegion == 'supremeni') {
        form = {
            'from_mobile': '1',
            'cookie-sub': spcPost,
            'same_as_billing_address': '1',
            'order[billing_name]': profile.fullName,
            'order[email]': profile.email,
            'order[tel]': profile.phoneNumber,
            'order[billing_address]': profile.address,
            'order[billing_address_2]': profile.aptSuite,
            'order[billing_zip]': profile.zipCode,
            'order[billing_city]': profile.city,
            'order[billing_country]': 'NB',
            'credit_card[cnb]': profile.cardNumber,
            'credit_card[month]': profile.expiryMonth,
            'credit_card[year]': profile.expiryYear,
            'credit_card[type]': profile.cardType,
            'credit_card[vval]': profile.CVV,
            'order[terms]': '0',
            'order[terms]': '1',
            'g-recaptcha-response': token,
            'is_from_ios_native': '1'
        };
    } else if (task.taskRegion == 'supremesz') {
        form = {
            'from_mobile': '1',
            'cookie-sub': spcPost,
            'same_as_billing_address': '1',
            'order[billing_name]': profile.fullName,
            'order[email]': profile.email,
            'order[tel]': profile.phoneNumber,
            'order[billing_address]': profile.address,
            'order[billing_address_2]': profile.aptSuite,
            'order[billing_zip]': profile.zipCode,
            'order[billing_city]': profile.city,
            'order[billing_country]': 'CH',
            'credit_card[cnb]': profile.cardNumber,
            'credit_card[month]': profile.expiryMonth,
            'credit_card[year]': profile.expiryYear,
            'credit_card[type]': profile.cardType,
            'credit_card[vval]': profile.CVV,
            'order[terms]': '0',
            'order[terms]': '1',
            'g-recaptcha-response': token,
            'is_from_ios_native': '1'
        };
    } else if (task.taskRegion == 'supremees') {
        form = {
            'from_mobile': '1',
            'cookie-sub': spcPost,
            'same_as_billing_address': '1',
            'order[billing_name]': profile.fullName,
            'order[email]': profile.email,
            'order[tel]': profile.phoneNumber,
            'order[billing_address]': profile.address,
            'order[billing_address_2]': profile.aptSuite,
            'order[billing_zip]': profile.zipCode,
            'order[billing_city]': profile.city,
            'order[billing_country]': 'ES',
            'credit_card[cnb]': profile.cardNumber,
            'credit_card[month]': profile.expiryMonth,
            'credit_card[year]': profile.expiryYear,
            'credit_card[type]': profile.cardType,
            'credit_card[vval]': profile.CVV,
            'order[terms]': '0',
            'order[terms]': '1',
            'g-recaptcha-response': token,
            'is_from_ios_native': '1'
        };
	}
    request.post({
            url: `${baseURL}checkout.json`,
            proxy: '',
            followAllRedirects: true,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://www.supremenewyork.com',
                'Connection': 'keep-alive',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15G77',
                'Referer': 'https://www.supremenewyork.com/mobile',
                'Accept-Language': 'en-us',
                'Accept-Encoding': 'gzip, deflate'
            },
            form: form
        },
        function (error, response, body) {
            if (error) {
                bank.mainBotWin.send('taskUpdate', {
                    id: task.taskID,
                    message: 'ERROR. RETRYING'
                });
                setTimeout(() => exports.getCheckout(request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost), task.taskRetryDelay);
            } else {
                try {
                    parsedBody = JSON.parse(body);
                } catch (e) {}
                if (!parsedBody) {
                    bank.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        message: 'FAILED. RETRYING'
                    });
                    return setTimeout(() => exports.requestCaptcha(request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost), task.taskRetryDelay);
                }
                switch (parsedBody.status) {
                    case 'queued':
                        var _slug = parsedBody.slug;
                        bank.mainBotWin.send('taskUpdate', {
                            id: task.taskID,
                            message: 'AWAITING RESPONSE'
                        });
                        console.log('Slug Found.');
                        return exports.pollCheckout(request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost, _slug);
                    case 'paid':
                        successfulCheckout(request);
                        sendWebhook(parsedBody, true, 'Checked Out', task['itemImage']);
                        return bank.mainBotWin.send('taskUpdate', {
                            id: task.taskID,
                            message: 'CHECKED OUT'
                        });
                    case 'dup':
                        failedCheckout(request);
                        sendWebhook(parsedBody, false, 'Duplicate Order', task['itemImage']);
                        bank.taskStatuses[task.taskID] = 'idle';
                        return bank.mainBotWin.send('taskUpdate', {
                            id: task.taskID,
                            message: 'DUPLICATE ORDER'
                        });
                    case 'blocked_country':
                        failedCheckout(request);
                        sendWebhook(parsedBody, false, 'Country Blocked', task['itemImage']);
                        //bank.taskStatuses[task.taskID] = 'idle'; so they cant re start the task (no point anyway since country is blocked)
                        return bank.mainBotWin.send('taskUpdate', {
                            id: task.taskID,
                            message: 'BLOCKED COUNTRY'
                        });
                    case 'outOfStock':
                        failedCheckout(request);
                        sendWebhook(parsedBody, false, 'Out Of Stock', task['itemImage']);
                        bank.taskStatuses[task.taskID] = 'idle';
                        return bank.mainBotWin.send('taskUpdate', {
                            id: task.taskID,
                            message: 'OUT OF STOCK'
                        });
                    case 'failed':
                    default:
                        if (parsedBody.errors) {
                            if (parsedBody.errors['credit_card']) {
                                failedCheckout(request);
                                sendWebhook(parsedBody, false, 'Card Error', task['itemImage']);
                                bank.taskStatuses[task.taskID] = 'idle';
                                return bank.mainBotWin.send('taskUpdate', {
                                    id: task.taskID,
                                    message: 'CARD ERROR'
                                });
                            }
                            if (parsedBody.errors['order']) {
                                failedCheckout(request);
                                sendWebhook(parsedBody, false, 'Payment Failed', task['itemImage']);
                                bank.taskStatuses[task.taskID] = 'idle';
                                return bank.mainBotWin.send('taskUpdate', {
                                    id: task.taskID,
                                    message: 'PAYMENT FAILED'
                                });
                            }
                        }
                        failedCheckout(request);
                        sendWebhook(parsedBody, false, 'Payment Failed', task['itemImage']);
                        bank.taskStatuses[task.taskID] = 'idle';
                        return bank.mainBotWin.send('taskUpdate', {
                            id: task.taskID,
                            message: 'PAYMENT FAILED'
                        });
                }
            }
        });
}

exports.pollCheckout = function (request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost, _slug) {
    request.get({
            url: `https://www.supremenewyork.com/checkout/${_slug}/status.json`,
            proxy: '',
        },
        function (error, response, body) {
            if (error) {
                bank.mainBotWin.send('taskUpdate', {
                    id: task.taskID,
                    message: 'ERROR. RETRYING'
                });
                return exports.pollCheckout(request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost, _slug);
            } else {
                console.log(body);
                let parsedBody;
                try {
                    parsedBody = JSON.parse(body);
                } catch (e) {}
                if (!parsedBody) {
                    return exports.pollCheckout(request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost, _slug);
                }
                if (parsedBody.status === 'queued') {
                    bank.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        message: 'QUEUED'
                    });
                    return exports.pollCheckout(request, task, profile, productURL, productSku, styleSku, sizeSku, spcGet, spcPost, _slug);
                }
                if (parsedBody.status === 'failed') {
                    failedCheckout(request);
                    sendWebhook(parsedBody, false, 'Payment Failed', task['itemImage']);
                    bank.taskStatuses[task.taskID] = 'idle';
                    return bank.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        message: 'PAYMENT FAILED'
                    });
                }
                if (parsedBody.status === "paid") {
                    successfulCheckout(request);
                    sendWebhook(parsedBody, true, 'Checked Out', task['itemImage']);
                    return bank.mainBotWin.send('taskUpdate', {
                        id: task.taskID,
                        message: 'CHECKED OUT'
                    });
                }


            }
        });
}





exports.hasProductStyle = function (task, productData) {
    for (let i = 0; i < productData.length; i += 1) {
        let styleData;
        let name;
        let id;
        try {
            name = productData[i].name;
            id = productData[i].id;
            styleData = productData[i].sizes;
            itemImage = productData[i].image_url;
        } catch (e) {}
        if (id && name && styleData) {
            if (task.taskStyle.toLowerCase() == 'na') {
                // styleSku = id;
                console.log(`${name} found -> ${id}`);
                return {
                    'styleData': styleData,
                    'styleSku': id,
                    'itemImage': itemImage
                };
            }
            if (exports.hasKeywords(name.toLowerCase(), {
                    posKeywords: task.taskStyle.toLowerCase().split(','),
                    negKeywords: []
                })) {
                styleSku = id;
                return {
                    'styleData': styleData,
                    'styleSku': id,
                    'itemImage': itemImage
                };
            }
        }
    }
    return null;
}





exports.hasProductSize = function (task, styleData) {
    for (let i = 0; i < styleData.length; i += 1) {
        if (task.taskSize.toLowerCase() == "random" || task.taskSize.toLowerCase() == "na") {
            let randInt = Math.floor(Math.random() * styleData.length);
            //sizeSku = styleData[randInt].id;
            return styleData[randInt].id;
        }
        //TODO: ADD REGEX HERE
        if (styleData[i].name && styleData[i].name.toLowerCase() == task.taskSize.toLowerCase()) {
            //  sizeSku = styleData[i].id;
            return styleData[i].id;
        }
    }
    return null;
}








//Checking to find the product itself
//This logic is safe trust it
exports.hasKeywords = function (title, keywordsObj) {
    if (title == null || !keywordsObj) {
        return false;
    }
    title = title.toLowerCase();

    /* Check for all positive keywords */
    for (let p = 0; p < keywordsObj.posKeywords.length; p++) {
        if (!title.includes(keywordsObj.posKeywords[p].toLowerCase())) {
            return false;
        }
    }

    /* Check for all negative keywords */
    for (let n = 0; n < keywordsObj.negKeywords.length; n++) {
        if (title.includes(keywordsObj.negKeywords[n].toLowerCase())) {
            return false;
        }
    }

    return true;
};




function successfulCheckout(request) {
    require('getmac').getMac(function (err, macAddress) {
        if (err) {
            return;
        }
        request({
            url: 'https://codeyellow.io/api/taskSuccess.php',
            method: 'post',
            headers: {
                'x-auth-key': bank.getAuthHeader(global.settings.key, macAddress)
            },
            formData: {
                'key': global.settings.key,
                'mac_address': macAddress
            },
        }, function (err, response, body) {
            return;
        });
    });
}
// On checkout fail send POST request to update user dashboard
function failedCheckout(request) {
    require('getmac').getMac(function (err, macAddress) {
        if (err) {
            return;
        }
        request({
            url: 'https://codeyellow.io/api/taskFail.php',
            method: 'post',
            headers: {
                'x-auth-key': bank.getAuthHeader(global.settings.key, macAddress)
            },
            formData: {
                'key': global.settings.key,
                'mac_address': macAddress
            },
        }, function (err, response, body) {
            return;
        });
    });
}

function sendWebhook(parsedBody, success, status, itemImage) {
    try {
        if (itemImage.startsWith('//')) {
            itemImage = itemImage.replace('//', 'http://');
        }
        var itemInfo = parsedBody['mpa'][0];
        console.log({
            'name': itemInfo['Product Name'],
            'size': itemInfo['Product Size'],
            'style': itemInfo['Product Color'],
            'image': itemImage,
            'status': status,
            'webhook': 'saved'
        })
        bank.sendWebhook({
            'name': itemInfo['Product Name'],
            'size': itemInfo['Product Size'],
            'style': itemInfo['Product Color'],
            'image': itemImage,
            'status': status,
            'webhook': 'saved'
        }, success, false, null)
    } catch (e) {

    }
}




function shouldStop(taskid) {
    if (bank.taskStatuses[taskid] == 'stop') {
        bank.taskStatuses[taskid] = 'idle';
        return true;
    } else if (bank.taskStatuses[taskid] == 'delete') {
        bank.taskStatuses[taskid] = '';
        return true;
    } else {
        return false;
    }
}