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

const electron = require('electron');
const {
	ipcRenderer
} = electron;
// Main Variables
var settings = require('electron').remote.getGlobal('settings');
var profiles = require('electron').remote.getGlobal('profiles');
var tasks = [];
var oneClickTasks = [];
var proxies = require('electron').remote.getGlobal('proxies');
var releases = require('electron').remote.getGlobal('releases');
var updateRequired = require('electron').remote.getGlobal('updateRequired');
var downloadURL = require('electron').remote.getGlobal('downloadURL');
var selectedQuickTaskRelease;
if (updateRequired == true) {
	// $('#updateme').removeClass("hided");
}
// End Main Variables

// Loads saved proxies
loadProxies(proxies, false);

$('#webhookUrl').val(require('electron').remote.getGlobal('settings').discordWebhook);
settingsRetryDelay.value = require('electron').remote.getGlobal('settings').retryDelay;
amountr.value = require('electron').remote.getGlobal('settings').retryDelay;

// Loads all releases in the quick task area

loadReleases();






// Main notification's from bot
ipcRenderer.on('notify', function (event, data) {
	Materialize.toast(data.message, data.length, "rounded");
});

// Settings tab
// Save retry delay
$('#saveRetryDelay').click(function () {
	ipcRenderer.send('saveRetryDelay', settingsRetryDelay.value)
});

// Save webhook
$('#saveWebhook').click(function () {
	ipcRenderer.send('saveWebhook', $('#webhookUrl').val())
});

// Opens captcha harvester
$('#openHarvester').click(function () {
	ipcRenderer.send('openHarvester')
});










// Important tasks bit

// Update tasks
ipcRenderer.on('taskUpdate', function (event, data) {
	//$(`#taskResult${data.id}`).html(data.message.toUpperCase())
	$(`.enterRaffle#${data.id}`).html(data.message)
});

$("body").on("click", ".startTask", function () {
	var task = tasks[$(this).attr('id') - 1];
	ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
});

$("#startAllTasks").click(function () {
	$.each($(".startTask"), function () {
		var task = tasks[$(this).attr('id') - 1];
		ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
	});
});

$("body").on("click", ".deleteTask", function () {
	if ($('#taskResult' + $(this).attr('id')).html() == 'IDLE' || $('#taskResult' + $(this).attr('id')).html() == 'ENTRY SUBMITTED!') {
		var task = tasks[$(this).attr('id') - 1];
		tasks[$(this).attr('id') - 1] = {};
		$(this).parent().parent().remove();
	} else {
		Materialize.toast("You cannot delete a task in progress", 2000, "rounded");
	}
});

$("#deleteAllTasks").click(function () {
	var inprog = false;
	$.each($(".deleteTask"), function () {
		if ($('#taskResult' + $(this).attr('id')).html() == 'IDLE' || $('#taskResult' + $(this).attr('id')).html() == 'ENTRY SUBMITTED!') {
			var task = tasks[$(this).attr('id') - 1];
			tasks[$(this).attr('id') - 1] = {};
			$(this).parent().parent().remove();
		} else {
			inprog = true;
		}
	});
	if (inprog == true) {
		Materialize.toast("You cannot delete some tasks in progress", 2000, "rounded");
	}

});













// Proxies


$("#saveProxies").click(function () {
	ipcRenderer.send('saveProxies', proxies.join('\n'))
});

$("#addProxies").click(function () {
	var proxiesToAdd = $('#proxiesToAdd').val().split('\n')
	// just make it click it i think
	$('#proxiesTab').click()
	$('#proxiesTab').attr('class', 'nav-item active')
	loadProxies(proxiesToAdd, true);
	$('#proxiesToAdd').val('');
});

ipcRenderer.on('proxyUpdate', function (event, data) {
	$(`#proxyResult${data.id}`).html(data.message)
});

$("#checkAllProxies").click(function () {
	$.each($(".proxyInput"), function () {
		var proxyToTest = $(this).attr('id')
		var proxyID = $(this).data('uid');
		ipcRenderer.send('testProxy', {
			proxy: proxyToTest,
			id: proxyID
		})
	});
});

$("body").on("click", ".testProxy", function () {
	var proxyToTest = $(this).parent().parent().attr('id');
	var proxyID = $(this).attr('id');
	ipcRenderer.send('testProxy', {
		proxy: proxyToTest,
		id: proxyID
	})
});

$("body").on("click", ".deleteProxy", function () {
	var index = proxies.indexOf($(this).parent().parent().data('ip'));
	$(this).parent().parent().remove();
	if (index > -1) {
		proxies.splice(index, 1);
	}
});

$("#removeFailed").click(function () {
	$.each($(".proxyInput"), function () {
		var uid = $(this).data('uid');
		var failed = $('#proxyResult' + uid).html().toLowerCase() == 'failed' ? true : false;
		if (failed) {
			var index = proxies.indexOf($(this).data('ip'));
			console.log($(this).data('ip'));
			if (index > -1) {
				proxies.splice(index, 1);
			}
			$(this).remove()
		}
	});
});

function loadProxies(proxiesToAdd, addToArray) {
	for (var i = 0; i < proxiesToAdd.length; i++) {
		proxyFormat = '';
		var proxy = proxiesToAdd[i].split(':');
		var proxyIP = proxy[0];
		var randProxyID = proxyIP.replace(/\./g, "") + ((Math.random() * 1000000) + 1).toFixed().toString();
		var proxyPort = proxy[1];
		if (proxy.length == 2) {
			proxyFormat = `http://${proxyIP}:${proxyPort}`;
		} else {
			proxyFormat = `http://${proxy[2]}:${proxy[3]}@${proxyIP}:${proxyPort}`;
		}
		if (proxyIP != undefined && proxyPort != undefined) {
			$("tbody#proxies").append(
				`<tr class="proxyInput" id="${proxyFormat}" data-uid="${randProxyID}" data-ip="${proxiesToAdd[i]}">
				<td class="nob-l">${proxyIP}</td>
				<td>${proxyPort}</td>
				<td id="proxyResult${randProxyID}">RESULT</td>
				<td>
                     <button class="action-butt testProxy" id="${randProxyID}"><i class="fa fa-play" aria-hidden="true"></i></button>
                     <button class="action-butt deleteProxy"><i class="fa fa-trash" aria-hidden="true"></i></button>
                  </td>
			</tr>`);
			if (addToArray) {
				proxies.push(proxiesToAdd[i]);
			}
		} else {}
	}
}











// Tasks

$("#createTaskButton").click(function () {
	var taskSiteSelect = $('#taskSiteSelect').val();
	var taskSizeSelect = $('#taskSizeSelect').val();
	var taskProfile = $('#taskProfile').val();
	var taskSpecificProxy = $('#taskSpecificProxy').val();
	var taskQuantity = parseInt($('#taskQuantity').val());
	var taskEmail = $('#taskEmail').val();
	var proxyUsed = '<td><i class="fas fa-bolt noprox"></i></td>';
	if (selectedQuickTaskRelease != undefined) {
		if (taskSiteSelect != 'default') {
			if (taskSizeSelect != 'default') {
				if (taskQuantity >= 1) {
					if (validateEmail(taskEmail) != false) {
						for (var i = 0; i < taskQuantity; i++) {
							var taskID = tasks.length + 1;
							var proxy = '';
							if (taskSpecificProxy == '') {
								proxy = proxies[Math.floor(Math.random() * proxies.length)]
								/* Here we need to generate a saved proxy but for now its just this*/
								if (proxy == undefined) {
									proxy = '';
								}
							} else {
								proxy = taskSpecificProxy;
							}
							if (proxy != '') {
								proxyUsed = '<td><i class="fas fa-bolt isprox"></i></td>'
							}
							if (taskSiteSelect == 'nakedcph') {
								tasks.push({
									taskID: taskID,
									proxy: proxy,
									taskSiteSelect: taskSiteSelect,
									taskSizeSelect: taskSizeSelect,
									taskProfile: taskProfile,
									taskEmail: taskEmail,
									variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
									nakedcph: selectedQuickTaskRelease['nakedcph']
								});
							} else if (taskSiteSelect == 'footshop') {
								tasks.push({
									taskID: taskID,
									proxy: proxy,
									taskSiteSelect: taskSiteSelect,
									taskSizeSelect: taskSizeSelect,
									taskProfile: taskProfile,
									taskEmail: taskEmail,
									variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
									footshop: selectedQuickTaskRelease['footshop']
								});
							} else if (taskSiteSelect == 'ymeuniverse') {
								tasks.push({
									taskID: taskID,
									proxy: proxy,
									taskSiteSelect: taskSiteSelect,
									taskSizeSelect: taskSizeSelect,
									taskProfile: taskProfile,
									taskEmail: taskEmail,
									variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
									ymeuniverse: selectedQuickTaskRelease['ymeuniverse']
								});
							} else {
								tasks.push({
									taskID: taskID,
									proxy: proxy,
									taskSiteSelect: taskSiteSelect,
									taskSizeSelect: taskSizeSelect,
									taskProfile: taskProfile,
									taskEmail: taskEmail,
									variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
									fields: ''
								});
							}

							$("tbody#tasks").append(
								`<tr>
								<td>${taskID}</td>
								<td>${taskSiteSelect.toUpperCase()}</td>
								<td>${taskProfile.toUpperCase()}</td>
								<td id="taskResult${taskID}">IDLE</td>
								${proxyUsed}
								<td>
									<button class="action-butt startTask" id="${taskID}"><i class="fa fa-play" aria-hidden="true"></i>
									</button>
									<button class="action-butt deleteTask" id="${taskID}"><i class="fa fa-trash" aria-hidden="true"></i>
									</button>
								</td>
							</tr>`);
						}
						$('#defaultOpen').click()
						$('#defaultOpen').attr('class', 'nav-item active')
						selectedQuickTaskRelease = undefined;
						$('.selectQuick').html('SELECT')
						$('#taskQuantity').val('1')
						$('#taskSiteSelect').val('default')
						$('#taskSizeSelect').val('default')
						$('.taskSiteOption').prop('disabled', true);
						$('.taskSizeOption').prop('disabled', true);
						$('#taskSpecificProxy').val('')
						$('#taskEmail').val('')
					} else {
						Materialize.toast("Please input a valid Email", 2000, "rounded");
					}
				} else {
					Materialize.toast("Please input a valid Quantity", 2000, "rounded");
				}
			} else {
				Materialize.toast("Please select a Size", 2000, "rounded");
			}
		} else {
			Materialize.toast("Please select a Site", 2000, "rounded");
		}
	} else {
		Materialize.toast("Please select a Release", 2000, "rounded");

	}
});





















// Profiles

// Loads each profile for default
var profileKeys = Object.keys(profiles);
for (var i = 0; i < profileKeys.length; i++) {
	var keyName = profileKeys[i];
	$('#profileList').append($('<option>', {
		value: keyName,
		text: keyName
	}));
	$('#taskProfile').append($('<option>', {
		value: keyName,
		text: keyName
	}));
	$('#oneClicktaskProfile').append($('<option>', {
		value: keyName,
		text: keyName
	}));
}

$("#newProfile").click(function () {
	var profileName = $('#newProfileName').val();
	if (profiles[profileName] == null) {
		if (profileName != '') {
			$('#profileList').append($('<option>', {
				value: profileName,
				text: profileName
			}));
			$('#taskProfile').append($('<option>', {
				value: profileName,
				text: profileName
			}));
			$('#oneClicktaskProfile').append($('<option>', {
				value: profileName,
				text: profileName
			}));
			profiles[profileName] = {
				"firstName": "",
				"lastName": "",
				"address": "",
				"aptSuite": "",
				"zipCode": "",
				"city": "",
				"country": "Country",
				"stateProvince": "default",
				"phoneNumber": "",
				"cardType": "default",
				"cardNumber": "",
				"expiryMonth": "MM",
				"expiryYear": "YY",
				"CVV": ""
			};
			$('#profileList').val(profileName);
			Materialize.toast("Profile '" + profileName + "' Created!", 2000, "rounded");
			//loadProfile(profileName, false);
		} else {
			Materialize.toast("Please enter a profile name", 2000, "rounded");
		}
	} else {
		Materialize.toast("Profile '" + profileName + "' Already Exists!", 2000, "rounded");
	}
});

// Saves the current profile selected
$("#saveProfile").click(function () {
	var profileName = $('#profileList option:selected').attr('value');
	if (profileName != 'Example Profile') {
		profiles[profileName] = {
			"firstName": $('#firstName').val(),
			"lastName": $('#lastName').val(),
			"address": $('#address').val(),
			"aptSuite": $('#aptSuite').val(),
			"zipCode": $('#zipCode').val(),
			"city": $('#city').val(),
			"country": $('#country').val(),
			"stateProvince": $('#stateProvince').val(),
			"phoneNumber": $('#phoneNumber').val(),
			"cardType": $('#cardType').val(),
			"cardNumber": $('#cardNumber').val(),
			"expiryMonth": $('#expiryMonth').val(),
			"expiryYear": $('#expiryYear').val(),
			"CVV": $('#CVV').val()
		};
		ipcRenderer.send('saveProfiles', profiles);
		Materialize.toast("Profile '" + profileName + "' Saved!", 2000, "rounded");
	} else {
		Materialize.toast("You can't Modify the Example Profile!", 2000, "rounded");
	}
});

// Deletes the current profile selected
$("#deleteProfile").click(function () {
	var profileName = $('#profileList option:selected').attr('value');
	// Makes sure its not the example profile
	if (profileName != 'Example Profile') {
		profiles[profileName] = undefined;
		delete profiles[profileName];
		ipcRenderer.send('saveProfiles', profiles);
		Materialize.toast("Profile '" + profileName + "' Deleted!", 2000, "rounded");
		$('#profileList').val('Example Profile');
		$('#profileList option[value="' + profileName + '"]').remove()
		$('#taskProfile option[value="' + profileName + '"]').remove()
		$('#oneClicktaskProfile option[value="' + profileName + '"]').remove()
	} else {
		Materialize.toast("You can't modify the Example Profile!", 2000, "rounded");
	}
});


// Function when you click load on a profile page profile
$("#loadProfile").click(function () {
	var profileName = $('#profileList option:selected').attr('value');
	loadProfile(profileName, true);
});

// Function to load profiles
function loadProfile(profileName, notify) {
	var profile = profiles[profileName];
	var keys = Object.keys(profile)
	for (var i = 0; i < keys.length; i++) {
		var value = profile[keys[i]];
		$('#' + keys[i]).val(value);
	}
	if (notify) {
		Materialize.toast("Profile '" + profileName + "' loaded!", 2000, "rounded");
	}
}















// Releases section on create task

function loadReleases() {
	var taskID = 0;
	for (var i = 0; i < releases.length; i++) {
		var release = releases[i];
		var sitesSupported = release['sites_supported'];
		var sitesSupportedKeys = Object.keys(sitesSupported);
		var filterID = release['filterID'];
		$(".releases-container").append(
			`<div style="height: 230px;" class="realsetter">
						<div class="setterhat">
							<div class="settit">${release['name']}</div>
							<div class="setinfo">${release['date']}</div>
						</div>
						<img class="retimg" src="${release['image']}" style="margin-top:-17px;">
						<div class="setterbum">
							<div class="price-it-up selectQuick" id="${i}">SELECT</div>
						</div>
					</div>`
		);
		$('#oneClickFilter').append($('<option>', {
			value: filterID,
			text: release['name']
		}));
		for (var x = 0; x < sitesSupportedKeys.length; x++) {
			var siteName = sitesSupportedKeys[x];
			var variant = sitesSupported[siteName];
			if (variant != 'closed') {
				oneClickTasks.push({
					taskSiteSelect: siteName,
					variant: variant,
					nakedcph: release['nakedcph'],
					ymeuniverse: release['ymeuniverse'],
					footshop: release['footshop']
				});
				var sizesHTML = '';
				var sizes = release['sizes_supported_' + siteName];
				for(var z = 0; z < sizes.length; z++)
				{
					if(sizes[z] == 'selectOnWin')
					{
						sizesHTML = sizesHTML + '<option class="taskSizeOption" value="'+sizes[z]+'">Selected on Win</option>\n';
					}
					else
					{
						sizesHTML = sizesHTML + '<option class="taskSizeOption" value="'+sizes[z]+'">'+sizes[z]+'</option>\n';
					}
				}
				$(".oneclick-container").append(`
					<div style="height: 400px;" class="raffle-enter-container" data-filter="${filterID}">
			
						<div class="raffle-im" ><img class="raffle-item" src="${release['image']}"></div>
						<div class="raff-t">${siteName.toUpperCase()}</div>
						<div class="feature">
						<div class="fcon"><i class="fas fa-clock"></i></div>
							${release['date']}
						</div>
						
						<div class="feature">
							<div style="width: 100%;float:left;" class="create-row">
							<div class="inputicon"><i class="fas fa-sort-amount-down" aria-hidden="true"></i>
						</div>
						<select class="createinput" id="oneClicktaskSize${taskID}">
							<option class="taskSizeOption" value="default">Size</option>
							${sizesHTML}
						</select>
					</div>
				</div>
				<a target="_blank">
				<div class="feature enter-r enterRaffle" id="${taskID}">
					Enter Raffle
				</div>
				</a>`);
				taskID += 1;
			}
		}
	}
}

$('#oneClickFilter').on('change', function () {
	var selectedVal = $('#oneClickFilter').val();
	if(selectedVal != 'default')
	{
		$.each($(".raffle-enter-container"), function () {
			var filter = $(this).data('filter')
			if(filter == selectedVal)
			{
				$(this).css('display', 'inline-block')
			}
			else
			{
				$(this).css('display', 'none')
			}
		});
	}
	else
	{
		$.each($(".raffle-enter-container"), function () {
			$(this).css('display', 'inline-block')
		});
	}
});

$(".raffle-enter-container").on('click', '.enterRaffle', function () {
	var taskID = $(this).attr('id');
	var oneClicktask = oneClickTasks[taskID];
	var taskSiteSelect = oneClicktask['taskSiteSelect'];
	var taskSizeSelect = $('#oneClicktaskSizeSelect').val();
	var taskSizeSelect = $('#oneClicktaskSize' + taskID).val();
	var taskProfile = $('#oneClicktaskProfile').val();
	var taskSpecificProxy = $('#oneClicktaskSpecificProxy').val();
	var taskEmail = $('#oneClicktaskEmail').val();
	if (taskProfile != 'Example Profile') {
		if (taskSiteSelect != 'default') {
			if (taskSizeSelect != 'default') {
				if (validateEmail(taskEmail) != false) {
					proxy = taskSpecificProxy;
					if (taskSiteSelect == 'nakedcph') {
						ipcRenderer.send('startTask', {
							taskID: taskID,
							proxy: proxy,
							taskSiteSelect: taskSiteSelect,
							taskSizeSelect: taskSizeSelect,
							taskProfile: taskProfile,
							taskEmail: taskEmail,
							variant: oneClicktask['variant'],
							nakedcph: oneClicktask['nakedcph']
						}, profiles[taskProfile]);
					} else if (taskSiteSelect == 'footshop') {
						ipcRenderer.send('startTask', {
							taskID: taskID,
							proxy: proxy,
							taskSiteSelect: taskSiteSelect,
							taskSizeSelect: taskSizeSelect,
							taskProfile: taskProfile,
							taskEmail: taskEmail,
							variant: oneClicktask['variant'],
							footshop: oneClicktask['footshop']
						}, profiles[taskProfile]);
					} else if (taskSiteSelect == 'ymeuniverse') {
						ipcRenderer.send('startTask', {
							taskID: taskID,
							proxy: proxy,
							taskSiteSelect: taskSiteSelect,
							taskSizeSelect: taskSizeSelect,
							taskProfile: taskProfile,
							taskEmail: taskEmail,
							variant: oneClicktask['variant'],
							ymeuniverse: oneClicktask['ymeuniverse']
						}, profiles[taskProfile]);
					}
				} else {
					Materialize.toast("Please input a valid Email", 2000, "rounded");
				}
			} else {
				Materialize.toast("Please select a Size", 2000, "rounded");
			}
		} else {
			Materialize.toast("Please select a Site", 2000, "rounded");
		}
	} else {
		Materialize.toast("You cannot enter a raffle with the example profile.", 2000, "rounded");
	}
});

$(".releases-container").on('click', '.selectQuick', function () {
	$('.selectQuick').html('SELECT')
	$('#taskSiteSelect').val('default')
	$('#taskSizeSelect').val('default')
	$('.taskSiteOption').prop('disabled', true);
	$('.taskSizeOption').prop('disabled', true);
	var id = $(this).attr('id');
	var release = releases[id];
	var sitesAvailable = Object.keys(releases[id]['sites_supported']);
	for (var i = 0; i < sitesAvailable.length; i++) {
		$('.taskSiteOption[value="' + sitesAvailable[i] + '"').prop('disabled', false);
	}

	$(this).html('SELECTED')
	selectedQuickTaskRelease = release;
});

$('#taskSiteSelect').on('change', function () {
	$('#taskSizeSelect').val('default')
	$('.taskSizeOption').prop('disabled', true);
	var sizesAvailable = selectedQuickTaskRelease['sizes_supported_' + this.value];
	for (var i = 0; i < sizesAvailable.length; i++) {
		$('.taskSizeOption[value="' + sizesAvailable[i] + '"').prop('disabled', false);
	}
});





// Email validation
function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}