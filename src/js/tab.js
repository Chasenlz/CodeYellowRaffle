/* function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("nav-item");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace("active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}
 
// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click(); */

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

var tabx = 1;

$("#defaultOpen").click(function () {
  tabx = 1;
  createtabx = 1;
  if (tabx = 1) {
    $(".under-line").get(0).style.setProperty("left", "4%");
    $(".tasks").get(0).style.setProperty("left", "0");
    $(".tasks").get(0).style.setProperty("top", "90px");
    $(".middle-me").get(0).style.setProperty("width", "150px");
    $(".under-line").get(0).style.setProperty("height", "6px");
  }
});

$("#profilesTab").click(function () {
  tabx = 2;
  createtabx = 1;
  if (tabx = 2) {
    $(".under-line").get(0).style.setProperty("left", "24.5%");
    $(".tasks").get(0).style.setProperty("left", "-100%");
    $(".tasks").get(0).style.setProperty("top", "90px");
    $(".middle-me").get(0).style.setProperty("width", "150px");
    $(".under-line").get(0).style.setProperty("height", "6px");
  }
});

$("#proxiesTab").click(function () {
  tabx = 3;
  createtabx = 1;
  if (tabx = 3) {
    $(".under-line").get(0).style.setProperty("left", "63.5%");
    $(".tasks").get(0).style.setProperty("left", "-200%");
    $(".tasks").get(0).style.setProperty("top", "90px");
    $(".middle-me").get(0).style.setProperty("width", "150px");
    $(".under-line").get(0).style.setProperty("height", "6px");
  }
});

$("#settingsTab").click(function () {
  tabx = 4;
  createtabx = 1;
  if (tabx = 4) {
    $(".under-line").get(0).style.setProperty("left", "83.5%");
    $(".tasks").get(0).style.setProperty("left", "-300%");
    $(".tasks").get(0).style.setProperty("top", "90px");
    $(".middle-me").get(0).style.setProperty("width", "120px");
    $(".under-line").get(0).style.setProperty("height", "6px");
  }
});

$("#creattask").click(function () {
  tabx = 5;
  createtabx = 1;
  if (tabx = 5) {
    $(".tasks").get(0).style.setProperty("left", "100%");
    $(".tasks").get(0).style.setProperty("top", "80px");
    $(".middle-me").get(0).style.setProperty("width", "120px");
    $(".under-line").get(0).style.setProperty("height", "0px");
  }
});

$("#addprox").click(function () {
  tabx = 5;
  if (tabx = 5) {
    $(".tasks").get(0).style.setProperty("left", "-200%");
    $(".tasks").get(0).style.setProperty("top", "-100%");
    $(".middle-me").get(0).style.setProperty("width", "120px");
    $(".under-line").get(0).style.setProperty("height", "0px");
  }
});

$("#autoenter").click(function () {
  tabx = 6;
  if (tabx = 6) {
    $(".under-line").get(0).style.setProperty("left", "83.5%");
    $(".tasks").get(0).style.setProperty("left", "-400%");
    $(".tasks").get(0).style.setProperty("top", "90px");
    $(".middle-me").get(0).style.setProperty("width", "150px");
    $(".under-line").get(0).style.setProperty("height", "0px");
  }
});

$("#eeconfig").click(function () {
  tabx = 7;
  if (tabx = 7) {
    $(".tasks").get(0).style.setProperty("left", "0%");
    $(".tasks").get(0).style.setProperty("top", "-100%");
    $(".middle-me").get(0).style.setProperty("width", "120px");
    $(".under-line").get(0).style.setProperty("height", "0px");
  }
});

$("#addMails").click(function () {
  tabx = 1;
  if (tabx = 1) {
    $(".under-line").get(0).style.setProperty("left", "4%");
    $(".tasks").get(0).style.setProperty("left", "0");
    $(".tasks").get(0).style.setProperty("top", "90px");
    $(".middle-me").get(0).style.setProperty("width", "150px");
    $(".under-line").get(0).style.setProperty("height", "6px");
  }
});

$('.customCheckbx').change(function () {
  if ($(this).is(':checked')) {
    $(".under-line").get(0).style.setProperty("transition", "0s");
    $(".tasks").get(0).style.setProperty("transition", "0s");
  } else {
    $(".under-line").get(0).style.setProperty("transition", ".5s");
    $(".tasks").get(0).style.setProperty("transition", ".5s");
  }
});





var createtabx = 1;


$(".plus1").click(function () {
  if (createtabx == 1) {
    if (selectedQuickTaskRelease == undefined) {
      Materialize.toast("Please select a Release", 2000, "rounded");
      return;
    }
  } else if (createtabx == 2) {
    var taskProfile = $('#taskProfile').val();
    var taskSiteSelect = $('#taskSiteSelect').val();
    var taskSizeSelect = $('#taskSizeSelect').val();
    if (taskProfile == 'Example Profile') {
      Materialize.toast("You cannot create a task with the example profile", 2000, "rounded");
      return;
    }

    if (taskSiteSelect == 'default') {
      Materialize.toast("Please select a site.", 3500, "rounded");
      return;
    }

    if (taskSiteSelect == 'footpatroluk' && profiles[taskProfile]['country'] != 'United Kingdom') {
      Materialize.toast("The site you have selected is for UK profile only.", 3500, "rounded");
      return;
    }

    if (taskSiteSelect == 'supplystore' && profiles[taskProfile]['country'] != 'Australia') {
      Materialize.toast("The site you have selected is for an Australian profiles only.", 3500, "rounded");
      return;
    }

    if (taskSizeSelect == 'default') {
      Materialize.toast("Please select a Size", 2000, "rounded");
      return;
    }
  } else if (createtabx == 3) {
    var taskTypeOfEmail = $('#taskTypeOfEmail').val();
    var taskTypeOfProxy = $('#taskTypeOfProxy').val();

    if (taskTypeOfEmail == 'default') {
      Materialize.toast("Please select an email type.", 3500, "rounded");
      return;
    }

    if (taskTypeOfProxy == 'default') {
      Materialize.toast("Please select proxies type.", 3500, "rounded");
      return;
    }
  }
  createtabx++;
  console.log(createtabx);
});

$(".min1").click(function () {
  createtabx -= 1;
  console.log(createtabx);
});

$(".craterv2").click(function () {
  createtabx = 1;
});


$(".min1, .plus1, .refro").click(function () {
  if (createtabx == 1) {
    $(".sneaksel").get(0).style.setProperty("display", "block");
    $(".details1").get(0).style.setProperty("display", "none");
    $(".details2").get(0).style.setProperty("display", "none");
    $(".details3").get(0).style.setProperty("display", "none");
  } else if (createtabx == 2) {
    $(".sneaksel").get(0).style.setProperty("display", "none");
    $(".details1").get(0).style.setProperty("display", "block");
    $(".details2").get(0).style.setProperty("display", "none");
    $(".details3").get(0).style.setProperty("display", "none");
  } else if (createtabx == 3) {
    $(".sneaksel").get(0).style.setProperty("display", "none");
    $(".details1").get(0).style.setProperty("display", "none");
    $(".details2").get(0).style.setProperty("display", "block");
    $(".details3").get(0).style.setProperty("display", "none");
  } else if (createtabx == 4) {
    $(".sneaksel").get(0).style.setProperty("display", "none");
    $(".details1").get(0).style.setProperty("display", "none");
    $(".details2").get(0).style.setProperty("display", "none");
    $(".details3").get(0).style.setProperty("display", "block");
  }
});








$(".ccreate").click(function () {
  tabx = 1;
  createtabx = 1;
  console.log(createtabx);

  if (createtabx == 1) {
    $(".details1").get(0).style.setProperty("display", "none");
    $(".sneaksel").get(0).style.setProperty("display", "block");
  } else if (createtabx == 2) {
    $(".details1").get(0).style.setProperty("display", "block");
    $(".sneaksel").get(0).style.setProperty("display", "none");
  }

  if (tabx = 1) {
    $(".under-line").get(0).style.setProperty("left", "4%");
    $(".tasks").get(0).style.setProperty("left", "0");
    $(".tasks").get(0).style.setProperty("top", "90px");
    $(".middle-me").get(0).style.setProperty("width", "150px");
    $(".under-line").get(0).style.setProperty("height", "6px");
  }
});

$(".massenter").click(function () {
  $("#massenter").css("display", "block");
  $("#autoenterx").css("display", "none");
});

$(".singleenter").click(function () {
  $("#massenter").css("display", "none");
  $("#autoenterx").css("display", "block");
});

$(document).on("click", function () {

  var proxy_count = $('.proxbod').find('tr').length - 1;

  $("#proxycount").text("" + proxy_count + "");

});


var slider = document.getElementById("gmailLimit");
var output = document.getElementById("gmailLimitShow");
output.innerHTML = slider.value;

slider.oninput = function () {
  output.innerHTML = this.value;
}

var slider2 = document.getElementById("catchallLimit");
var output2 = document.getElementById("catchallLimitShow");
output2.innerHTML = slider2.value;

slider2.oninput = function () {
  output2.innerHTML = this.value;
}

var slider3 = document.getElementById("proxyQuantity");
var output3 = document.getElementById("proxyscrapeShow");
output3.innerHTML = slider3.value;

slider3.oninput = function () {
  output3.innerHTML = this.value;
}

var slider4 = document.getElementById("taskQuantity");
var output4 = document.getElementById("taskQuantityShow");
output4.innerHTML = slider4.value;

slider4.oninput = function () {
  output4.innerHTML = this.value;
}