const electron = require('electron');
const {
	ipcRenderer
} = electron;
// Main Variables
var settings = require('electron').remote.getGlobal('settings');
var profiles = require('electron').remote.getGlobal('profiles');
var tasks = [];
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

// Loads all releases in the quick task area

loadReleases();





// Main notification's from bot
ipcRenderer.on('notify', function (event, data) {
	Materialize.toast(data.message, data.length, "rounded");
});












// Important tasks bit

// Update tasks
ipcRenderer.on('taskUpdate', function (event, data) {
	$(`#taskResult${data.id}`).html(data.message)
});

$("body").on("click", ".startTask", function () {
	var task = tasks[$(this).attr('id') - 1];
	ipcRenderer.send('startTask', task);
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
							if(proxy != '')
							{
								proxyUsed = '<td><i class="fas fa-bolt isprox"></i></td>'
							}
								
							tasks.push({
								taskID: taskID,
								proxy: proxy,
								taskSiteSelect: taskSiteSelect,
								taskSizeSelect: taskSizeSelect,
								taskProfile: taskProfile,
								taskEmail: taskEmail,
								variant: selectedQuickTaskRelease['sites_supported'][taskSiteSelect]
							});
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
			profiles[profileName] = {
				"fullName": "",
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
			"fullName": $('#fullName').val(),
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
	for (var i = 0; i < releases.length; i++) {
		var release = releases[i];
		$(".releases-container").append(
			`<div style="height: 230px;" class="realsetter">
						<div class="setterhat">
							<div class="settit">${release['name']}</div>
							<div class="setinfo">${release['date']}</div>
						</div>
						<img class="retimg" src="${release['image']}">
						<div class="setterbum">
							<div class="price-it-up selectQuick" id="${i}">SELECT</div>
						</div>
					</div>`
		);
	}
}

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

	var sizesAvailable = release['sizes_supported'];
	for (var i = 0; i < sizesAvailable.length; i++) {
		$('.taskSizeOption[value="' + sizesAvailable[i] + '"').prop('disabled', false);
	}

	$(this).html('SELECTED')
	selectedQuickTaskRelease = release;
});







// Email validation
function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}