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
var emails = require('electron').remote.getGlobal('emails');
var tasks = [];
var oneClickTasks = [];
var proxies = require('electron').remote.getGlobal('proxies');
var releases = require('electron').remote.getGlobal('releases');
var updateRequired = require('electron').remote.getGlobal('updateRequired');
var selectedQuickTaskRelease;
var emailsForTasks = {};
if (updateRequired != true) {
	$('.update-dot.updateav').css("display", "none");
}
// End Main Variables

// Loads saved proxies
loadProxies(proxies, false);

// Loads saved emails
loadEmails(emails);

$('#webhookUrl').val(require('electron').remote.getGlobal('settings').discordWebhook);
settingsRetryDelay.value = require('electron').remote.getGlobal('settings').retryDelay;
amountr.value = require('electron').remote.getGlobal('settings').retryDelay;

// Loads all releases in the quick task area

loadReleases();




ipcRenderer.on('profilesImported', function (event, data) {
	console.log(data);
	profiles = data;
	ipcRenderer.send('saveProfiles', profiles);
	var profileKeys = Object.keys(data);
	for (var i = 0; i < profileKeys.length; i++) {
		var keyName = profileKeys[i];
		if ($('#profileList option[value="' + keyName + '"]').length < 1) {
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
	}
});

document.getElementById('importProfiles').onchange = function () {
	ipcRenderer.send('importProfiles', this.files[this.files.length - 1]['path'])
	importProfiles.value = '';
};

document.getElementById('exportProfiles').onchange = function () {
	ipcRenderer.send('exportProfiles', this.files[this.files.length - 1]['path'])
	exportProfiles.value = '';
};

//If update available and update icon clicked
$('.update-dot.updateav').click(function () {
	ipcRenderer.send('downloadUpdate');
});

// Close bot
$('#closeM').click(function () {
	ipcRenderer.send('closeM');
});

// Minimize bot
$("#minimizeM").click(function () {
	ipcRenderer.send('minimizeM');
});

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
	if (data.type == 'mass') {
		$(`#taskResult${data.id}`).html(data.message.toUpperCase())
	} else {
		$(`.enterRaffle#${data.id}`).html(data.message)
	}
});

$("body").on("click", ".startTaskMass", function () {
	var task = tasks[$(this).attr('id') - 1];
	ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
});

$("#startAllTasks").click(function () {
	$.each($(".startTaskMass"), function () {
		var task = tasks[$(this).attr('id') - 1];
		ipcRenderer.send('startTask', task, profiles[task['taskProfile']]);
	});
});

$("body").on("click", ".deleteTask", function () {
	var task = tasks[$(this).attr('id') - 1];
	tasks[$(this).attr('id') - 1] = {};
	ipcRenderer.send('deleteTask', task);
	emailsForTasks[task['taskEmail']][task['taskSiteSelect'] + '_' + task['filterID']] = false;
	$(this).parent().parent().remove();
});

$("#deleteAllTasks").click(function () {
	$.each($(".deleteTask"), function () {
		var task = tasks[$(this).attr('id') - 1];
		tasks[$(this).attr('id') - 1] = {};
		ipcRenderer.send('deleteTask', task);
		emailsForTasks[task['taskEmail']][task['taskSiteSelect'] + '_' + task['filterID']] = false;
		$(this).parent().parent().remove();
	});
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

$("#deleteAllProxies").click(function () {
	$.each($(".deleteProxy"), function () {
		$(this).click()
	});
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

$("#scrapeProxies").click(function () {
	var country = $('.prox-sel').data('country');
	ipcRenderer.send('scrapeProxies', {
		country: country,
		amount: $('#proxyQuantity').val()
	})
});

ipcRenderer.on('proxiesScraped', function (event, proxies) {
	$('#proxiesToAdd').val(proxies)
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
	var taskTypeOfEmail = $('#taskTypeOfEmail').val();
	var taskTypeOfProxy = $('#taskTypeOfProxy').val();
	var taskSizeVariant = selectedQuickTaskRelease['sizes_supported_' + taskSiteSelect][taskSizeSelect];
	if(taskSizeVariant == undefined)
	{
		Materialize.toast("Task size variant does not exist.", 3500, "rounded");
		return;
	}
	if(taskSiteSelect == 'footpatroluk' && profiles[taskProfile]['country'] != 'United Kingdom')
	{
		Materialize.toast("The site you have selected is for UK profile only.", 3500, "rounded");
		return;
	}
	if(taskSiteSelect == 'supplystore' && profiles[taskProfile]['country'] != 'Australia')
	{
		Materialize.toast("The site you have selected is for an Australian profiles only.", 3500, "rounded");
		return;
	}
	if(profiles[taskProfile]['address'] == '')
	{
		Materialize.toast("Profile does not have a saved address. Are you sure you clicked save?", 3500, "rounded");
		return;
	}
	if (taskQuantity > Object.keys(emails).length && taskTypeOfEmail == 'saved') {
		Materialize.toast("You only have " + Object.keys(emails).length + " emails saved, but want " + taskQuantity + " tasks", 3500, "rounded");
		return;
	}
	if(taskProfile == 'Example Profile')
	{
		Materialize.toast("You cannot create a task with the example profile", 2000, "rounded");
		return;
	}
	var proxyUsed = '<td><i class="fas fa-bolt noprox"></i></td>';
	if (selectedQuickTaskRelease != undefined) {
		if (taskSiteSelect != 'default') {
			if (taskSizeSelect != 'default') {
				if (taskQuantity >= 1) {
					if (validateEmail(taskEmail) != false || taskTypeOfEmail != 'newEmail') {
						for (var i = 0; i < taskQuantity; i++) {
							if (createTask(taskSiteSelect, taskSizeSelect, taskProfile, taskSpecificProxy, taskQuantity, taskEmail, taskTypeOfEmail, proxyUsed, taskTypeOfProxy, taskSizeVariant) == true) {
								return;
							}
						}

						$('#defaultOpen').click()
						$('#defaultOpen').attr('class', 'nav-item active')
						selectedQuickTaskRelease = undefined;
						$('.selectQuick').html('SELECT')
						$('#taskSiteSelect').val('default')
						$('#taskSizeSelect').val('default')
						$('.taskSiteOption').prop('disabled', true);
						$('.taskSizeOptionMass').prop('disabled', true);
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





function createTask(taskSiteSelect, taskSizeSelect, taskProfile, taskSpecificProxy, taskQuantity, taskEmail, taskTypeOfEmail, proxyUsed, taskTypeOfProxy, taskSizeVariant) {
	if (taskTypeOfEmail == 'saved') {
		var emailKeys = Object.keys(emails);
		taskEmail = emailKeys[Math.floor(Math.random() * emailKeys.length)];
		if (taskEmail == '') {
			Materialize.toast("You have no saved emails. Please save some emails, or enter a new one", 2000, "rounded");
			return true;
		}
	} else if (taskTypeOfEmail == 'newEmail') {
		taskEmail = taskEmail;
	} else {
		Materialize.toast("Please select an email type", 2000, "rounded");
		return true;
	}
	var taskID = tasks.length + 1;
	var proxy = '';
	if(taskTypeOfProxy != 'noProxy' && taskTypeOfProxy != 'default')
	{
		if (taskSpecificProxy == '') {
			if(taskTypeOfProxy == 'savedProxies')
			{
				proxy = proxies[Math.floor(Math.random() * proxies.length)];
				if (proxy == undefined) {
					proxy = '';
				}
			}
		} else {
			if(taskTypeOfProxy == 'specificProxy')
			{
				proxy = taskSpecificProxy;
			}
			else
			{
				proxy = '';
			}
		}
	}
	if (proxy != '') {
		proxyUsed = '<td><i class="fas fa-bolt isprox"></i></td>'
	}
	var variantName = taskSiteSelect + '_' + selectedQuickTaskRelease['filterID'];
	if (emailsForTasks[taskEmail] != undefined) {
		if (emailsForTasks[taskEmail][variantName] == true) {
			//console.log("Email already used");
			createTask(taskSiteSelect, taskSizeSelect, taskProfile, taskSpecificProxy, taskQuantity, taskEmail, taskTypeOfEmail, proxyUsed, taskTypeOfProxy, taskSizeVariant)
			return;
		}
	}
	emailsForTasks[taskEmail] = {};
	emailsForTasks[taskEmail][variantName] = true;
	if (taskSiteSelect == 'nakedcph') {
		tasks.push({
			taskID: taskID,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			nakedcph: selectedQuickTaskRelease['nakedcph']
		});
	} else if (taskSiteSelect == 'footshop') {
		tasks.push({
			taskID: taskID,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			footshop: selectedQuickTaskRelease['footshop']
		});
	} else if (taskSiteSelect == 'ymeuniverse') {
		tasks.push({
			taskID: taskID,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			ymeuniverse: selectedQuickTaskRelease['ymeuniverse']
		});
	} else if (taskSiteSelect == 'dsml') {
		tasks.push({
			taskID: taskID,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			dsml: selectedQuickTaskRelease['dsml']
		});
	} else if (taskSiteSelect == 'dsmny') {
		tasks.push({
			taskID: taskID,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			dsmny: selectedQuickTaskRelease['dsmny']
		});
	}  else if (taskSiteSelect == 'oneblockdown') {
		tasks.push({
			taskID: taskID,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			oneblockdown: selectedQuickTaskRelease['oneblockdown']
		});
	} else if (taskSiteSelect == 'supplystore') {
		tasks.push({
			taskID: taskID,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect],
			supplystore: selectedQuickTaskRelease['supplystore']
		});
	}  else {
		tasks.push({
			taskID: taskID,
			type: 'mass',
			filterID: selectedQuickTaskRelease['filterID'],
			taskTypeOfEmail: taskTypeOfEmail,
			proxy: proxy,
			taskSiteSelect: taskSiteSelect,
			taskSizeSelect: taskSizeSelect,
			taskSizeVariant: taskSizeVariant,
			taskProfile: taskProfile,
			taskEmail: taskEmail,
			variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect]
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
			<button class="action-butt startTaskMass" id="${taskID}"><i class="fa fa-play" aria-hidden="true"></i>
			</button>
			<button class="action-butt deleteTask" id="${taskID}"><i class="fa fa-trash" aria-hidden="true"></i>
			</button>
		</td>
	</tr>`);
}















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
				"CVV": "",
				"jigProfileName": false,
				"jigProfileAddress": false,
				"jigProfilePhoneNumber": false
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
	var stateProvince = $('#stateProvince').val();
	if (stateProvince == '' || stateProvince == 'none' || stateProvince == 'default') {
		stateProvince = '';
	}
	if (profileName != 'Example Profile') {
		profiles[profileName] = {
			"firstName": $('#firstName').val(),
			"lastName": $('#lastName').val(),
			"address": $('#address').val(),
			"aptSuite": $('#aptSuite').val(),
			"zipCode": $('#zipCode').val(),
			"city": $('#city').val(),
			"country": $('#country').val(),
			"stateProvince": stateProvince,
			"phoneNumber": $('#phoneNumber').val(),
			"cardType": $('#cardType').val(),
			"cardNumber": $('#cardNumber').val(),
			"expiryMonth": $('#expiryMonth').val(),
			"expiryYear": $('#expiryYear').val(),
			"CVV": $('#CVV').val(),
			"jigProfileName": $('#jigProfileName').is(':checked'),
			"jigProfileAddress": $('#jigProfileAddress').is(':checked'),
			"jigProfilePhoneNumber": $('#jigProfilePhoneNumber').is(':checked')
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
		if(keys[i] == 'jigProfileName' || keys[i] == 'jigProfileAddress' || keys[i] == 'jigProfilePhoneNumber')
		{
			if(value == true)
			{
				document.getElementById(keys[i]).checked = true;
			}
			else
			{
				document.getElementById(keys[i]).checked = false;
			}
		}
		else
		{
			$('#' + keys[i]).val(value);
		}
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
		var selectButton = release['closed'] == undefined ? `<div class="price-it-up selectQuick" id="${i}">SELECT</div>` : `<div class="price-it-up" style="font-weight: 600;">RELEASED</div>`;
		$(".shoe-container.releases").append(
			`<div style="height: 340px;width: 210px;margin-top: 20px;" class="raffle-enter-container">
			<div style="width: 210px;" class="raffle-im"><img class="raffle-item" src="${release['image']}"></div>
			<div style="font-size: 19px;" class="raff-t">${release['name']}</div>
			<div class="feature"><div class="fcon"><i class="fas fa-clock"></i></div>${release['date']}</div>
			<a target="_blank">${selectButton}</a>	
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
					dsml: release['dsml'],
					dsmny: release['dsmny'],
					footshop: release['footshop'],
					oneblockdown: release['oneblockdown'],
					supplystore: release['supplystore'],
					filterID: filterID,
					fullRelease: release
				});
				var sizesHTML = '';
				var sizes = Object.keys(release['sizes_supported_' + siteName]).sort(function(a, b){return a-b});
				for (var z = 0; z < sizes.length; z++) {
					if (sizes[z] == 'selectOnWin') {
						sizesHTML = sizesHTML + '<option class="taskSizeOption" value="' + sizes[z] + '">Selected on Win</option>\n';
					} else {
						sizesHTML = sizesHTML + '<option class="taskSizeOption" value="' + sizes[z] + '">' + sizes[z] + '</option>\n';
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

$('#taskTypeOfEmail').on('change', function () {
	var selectedVal = $('#taskTypeOfEmail').val();
	if (selectedVal == 'newEmail') {
		$('#taskEmail').prop('disabled', false)
	} else {
		$('#taskEmail').prop('disabled', true)
	}
});

$('#taskTypeOfProxy').on('change', function () {
	var selectedVal = $('#taskTypeOfProxy').val();
	if (selectedVal == 'specificProxy') {
		$('#taskSpecificProxy').prop('disabled', false)
	} else {
		$('#taskSpecificProxy').prop('disabled', true)
	}
});
$('#oneClickFilter').on('change', function () {
	var selectedVal = $('#oneClickFilter').val();
	if (selectedVal != 'default') {
		$.each($(".raffle-enter-container"), function () {
			var filter = $(this).data('filter')
			if (filter == selectedVal) {
				$(this).css('display', 'inline-block')
			} else {
				$(this).css('display', 'none')
			}
		});
	} else {
		$.each($(".raffle-enter-container"), function () {
			$(this).css('display', 'inline-block')
		});
	}
});

$(".raffle-enter-container").on('click', '.enterRaffle', function () {
	var taskID = $(this).attr('id');
	var oneClicktask = oneClickTasks[taskID];
	var taskSiteSelect = oneClicktask['taskSiteSelect'];
	var taskSizeSelect = $('#oneClicktaskSize' + taskID).val();
	var taskProfile = $('#oneClicktaskProfile').val();
	var taskSpecificProxy = $('#oneClicktaskSpecificProxy').val();
	var taskEmail = $('#oneClicktaskEmail').val();
	var taskSizeVariant = oneClicktask['fullRelease']['sizes_supported_' + taskSiteSelect][taskSizeSelect];
	if(taskSiteSelect == 'footpatroluk' && profiles[taskProfile]['country'] != 'United Kingdom')
	{
		Materialize.toast("The site you have selected is for UK profile only.", 3500, "rounded");
		return;
	}
	if(taskSiteSelect == 'supplystore' && profiles[taskProfile]['country'] != 'Australia')
	{
		Materialize.toast("The site you have selected is for an Australian profiles only.", 3500, "rounded");
		return;
	}
	if(profiles[taskProfile]['address'] == '')
	{
		Materialize.toast("Profile does not have a saved address. Are you sure you clicked save?", 3500, "rounded");
		return;
	}
	if (taskProfile != 'Example Profile') {
		if (taskSiteSelect != 'default') {
			if (taskSizeSelect != 'default') {
				if (validateEmail(taskEmail) != false) {
					proxy = taskSpecificProxy;
					if (taskSiteSelect == 'nakedcph') {
						ipcRenderer.send('startTask', {
							taskID: taskID,
							type: 'oneclick',
							filterID: oneClicktask['filterID'],
							proxy: proxy,
							taskSiteSelect: taskSiteSelect,
							taskSizeSelect: taskSizeSelect,
							taskSizeVariant: taskSizeVariant,
							taskProfile: taskProfile,
							taskEmail: taskEmail,
							variant: oneClicktask['variant'],
							nakedcph: oneClicktask['nakedcph']
						}, profiles[taskProfile]);
					} else if (taskSiteSelect == 'footshop') {
						ipcRenderer.send('startTask', {
							taskID: taskID,
							type: 'oneclick',
							filterID: oneClicktask['filterID'],
							proxy: proxy,
							taskSiteSelect: taskSiteSelect,
							taskSizeSelect: taskSizeSelect,
							taskSizeVariant: taskSizeVariant,
							taskProfile: taskProfile,
							taskEmail: taskEmail,
							variant: oneClicktask['variant'],
							footshop: oneClicktask['footshop']
						}, profiles[taskProfile]);
					} else if (taskSiteSelect == 'ymeuniverse') {
						ipcRenderer.send('startTask', {
							taskID: taskID,
							type: 'oneclick',
							filterID: oneClicktask['filterID'],
							proxy: proxy,
							taskSiteSelect: taskSiteSelect,
							taskSizeSelect: taskSizeSelect,
							taskSizeVariant: taskSizeVariant,
							taskProfile: taskProfile,
							taskEmail: taskEmail,
							variant: oneClicktask['variant'],
							ymeuniverse: oneClicktask['ymeuniverse']
						}, profiles[taskProfile]);
					} else if (taskSiteSelect == 'dsml') {
						ipcRenderer.send('startTask', {
							taskID: taskID,
							type: 'oneclick',
							filterID: oneClicktask['filterID'],
							proxy: proxy,
							taskSiteSelect: taskSiteSelect,
							taskSizeSelect: taskSizeSelect,
							taskSizeVariant: taskSizeVariant,
							taskProfile: taskProfile,
							taskEmail: taskEmail,
							variant: oneClicktask['variant'],
							dsml: oneClicktask['dsml']
						}, profiles[taskProfile]);
					} else if (taskSiteSelect == 'dsmny') {
						ipcRenderer.send('startTask', {
							taskID: taskID,
							type: 'oneclick',
							filterID: oneClicktask['filterID'],
							proxy: proxy,
							taskSiteSelect: taskSiteSelect,
							taskSizeSelect: taskSizeSelect,
							taskSizeVariant: taskSizeVariant,
							taskProfile: taskProfile,
							taskEmail: taskEmail,
							variant: oneClicktask['variant'],
							dsmny: oneClicktask['dsmny']
						}, profiles[taskProfile]);
					} else if (taskSiteSelect == 'oneblockdown') {
						ipcRenderer.send('startTask', {
							taskID: taskID,
							type: 'oneclick',
							filterID: oneClicktask['filterID'],
							proxy: proxy,
							taskSiteSelect: taskSiteSelect,
							taskSizeSelect: taskSizeSelect,
							taskSizeVariant: taskSizeVariant,
							taskProfile: taskProfile,
							taskEmail: taskEmail,
							variant: oneClicktask['variant'],
							oneblockdown: oneClicktask['oneblockdown']
						}, profiles[taskProfile]);
					} else if (taskSiteSelect == 'supplystore') {
						ipcRenderer.send('startTask', {
							taskID: taskID,
							type: 'oneclick',
							filterID: oneClicktask['filterID'],
							proxy: proxy,
							taskSiteSelect: taskSiteSelect,
							taskSizeSelect: taskSizeSelect,
							taskSizeVariant: taskSizeVariant,
							taskProfile: taskProfile,
							taskEmail: taskEmail,
							variant: oneClicktask['variant'],
							supplystore: oneClicktask['supplystore']
						}, profiles[taskProfile]);
					} else {
						ipcRenderer.send('startTask', {
							taskID: taskID,
							type: 'oneclick',
							filterID: oneClicktask['filterID'],
							proxy: proxy,
							taskSiteSelect: taskSiteSelect,
							taskSizeSelect: taskSizeSelect,
							taskSizeVariant: taskSizeVariant,
							taskProfile: taskProfile,
							taskEmail: taskEmail,
							variant: oneClicktask['variant']
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

$(".shoe-container.releases").on('click', '.selectQuick', function () {
	$('.selectQuick').html('SELECT')
	$('#taskSiteSelect').val('default')
	$('#taskSizeSelect').val('default')
	$('.taskSiteOption').prop('disabled', true);
	$('.taskSizeOptionMass').prop('disabled', true);
	var id = $(this).attr('id');
	var release = releases[id];
	var sitesAvailable = Object.keys(releases[id]['sites_supported']);
	for (var i = 0; i < sitesAvailable.length; i++) {
		var variant = releases[id]['sites_supported'][sitesAvailable[i]];
		if(variant != 'closed')
		{
			$('.taskSiteOption[value="' + sitesAvailable[i] + '"').prop('disabled', false);
		}
	}

	$(this).html('SELECTED')
	selectedQuickTaskRelease = release;
});

$('#taskSiteSelect').on('change', function () {
	$('#taskSizeSelect').val('default')
	$('.taskSizeOptionMass').prop('disabled', true);
	var sizesAvailable = Object.keys(selectedQuickTaskRelease['sizes_supported_' + this.value]).sort(function(a, b){return a-b});
	for (var i = 0; i < sizesAvailable.length; i++) {
		$('.taskSizeOptionMass[value="' + sizesAvailable[i] + '"').prop('disabled', false);
	}
});



$("#saveEmailList").click(function () {
	var emailsToSave = $('#emailsToSave').val().split('\n')
	emails = {};
	if (emailsToSave.length == 1 && emailsToSave[0] == '') {
		emails = {};
		loadEmails({});
		ipcRenderer.send('saveEmails', emails)
		$('#defaultOpen').click()
		return;
	}
	var error = false;
	var error2 = false;
	$('#defaultOpen').click()
	for (var i = 0; i < emailsToSave.length; i++) {
		var email = emailsToSave[i];
		if (validateEmail(email) != false) {
			if (emails[email] == undefined) {
				emails[email] = {};
			} else {
				if (email != '') {
					error2 = true;
				}
			}
		} else {
			if (email != '') {
				error = true;
			}
		}
	}
	loadEmails(emails);
	ipcRenderer.send('saveEmails', emails)
	if (error2) {
		Materialize.toast("Some of your emails are already saved and therefore have not been saved.", 2000, "rounded");
		return;
	}

	if (error) {
		Materialize.toast("Some of your emails are not valid and therefore have not been saved.", 2000, "rounded");
	} else {
		Materialize.toast("Saving and updating emails.", 2000, "rounded");
	}
});

// Generate gmail dot trick emails
$('#generateGmails').click(function () {
	var gmail = $('#gmailJigInput').val();
	if (gmail == '') {
		Materialize.toast("Please enter a gmail email address.", 2000, "rounded");
	} else {
		var email = gmail;
		var emailsRequired = $('#gmailLimit').val();
		var emailsGenerated = 0;
		let username = email.split('@')[0];
		var username_length = username.length;
		var combinations = Math.pow(2, username_length - 1);
		for (i = 0; i < combinations; i++) {
			var bin = decbin(i, username_length - 1);
			var full_email = "";
			for (j = 0; j < (username_length - 1); j++) {
				full_email += username[j];
				if (bin[j] == 1) {
					full_email += ".";
				}
			}
			full_email += username[j] + "@gmail.com";
			if (emailsGenerated < emailsRequired) {
				$('#emailsToSave').val($('#emailsToSave').val() + full_email + '\n')
				emailsGenerated += 1;
			} else {
				return;
			}
		}
	}
});

// Generate catchall emails
$('#generateCatchalls').click(function () {
	var catchall = $('#catchallJigInput').val();
	var emailsRequired = $('#catchallLimit').val();
	if (catchall == '') {
		Materialize.toast("Please enter a catchall domain.", 2000, "rounded");
	} else {
		if (catchall.includes('@')) {
			for (var i = 0; i < emailsRequired; i++) {
				var full_email = randomString(Math.floor(Math.random() * (22 - 8) + 8)) + catchall;
				$('#emailsToSave').val($('#emailsToSave').val() + full_email + '\n')
			}
		} else {
			for (var i = 0; i < emailsRequired; i++) {
				var full_email = randomString(Math.floor(Math.random() * (22 - 8) + 8)) + '@' + catchall;
				$('#emailsToSave').val($('#emailsToSave').val() + full_email + '\n')
			}
		}
	}
});


function loadEmails(emailsToAdd) {
	$('#emailsToSave').val('')
	emailsToAdd = Object.keys(emailsToAdd);
	for (var i = 0; i < emailsToAdd.length; i++) {
		$('#emailsToSave').val($('#emailsToSave').val() + emailsToAdd[i] + '\n')
	}
}



// Email validation
function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}







// Used for gmail jig
function decbin(dec, length) {
	var out = "";
	while (length--)
		out += (dec >> length) & 1;
	return out;
}

// Used for catchall jig
var randomString = function (len, bits) {
	bits = bits || 36;
	var outStr = "",
		newStr;
	while (outStr.length < len) {
		newStr = Math.random().toString(bits).slice(2);
		outStr += newStr.slice(0, Math.min(newStr.length, (len - outStr.length)));
	}
	return outStr.toUpperCase();
};

$('#country').on('change', function () {
	var country = $(this).val();
	if (country == 'United States') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".USProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Canada') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".CAProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Italy') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".ITProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Belgium') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".BGProfileState"), function () {
			$(this).css('display', 'block')
		});
	}
	 else if (country == 'Australia') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".AUSProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Germany') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".DEProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Slovenia') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".SIProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'France') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".FRProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Netherlands') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".NLProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'China') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".CNProfileState"), function () {
			$(this).css('display', 'block')
		});
	} else if (country == 'Sweden') {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
		$.each($(".SWEProfileState"), function () {
			$(this).css('display', 'block')
		});
	}  else {
		$.each($(".stateSelectOption"), function () {
			$(this).css('display', 'none')
		});
	}
});