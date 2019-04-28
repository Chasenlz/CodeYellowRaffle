$('#vespa').click(function() {

$(".shift-c").toggleClass("ignup");

$(".sign-up-main").toggleClass("rii");

$(".sign-op-main").toggleClass("skop");

	setTimeout(function() {
	
	$("#rig").toggleClass("hide");
	$("#can").toggleClass("hide");

	}, 500);


  
});

$('.cancelp').click(function() {

$(".shift-c").toggleClass("ignup");

$(".sign-up-main").toggleClass("rii");

$(".sign-op-main").toggleClass("skop");

	$("#rig").toggleClass("hide");
	$("#can").toggleClass("hide");


  
});





$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip(); 
});

$(document).mousemove(function(event){
	 var proxam = $("#amount").val()

   $(".toutput").text(proxam);
  });
  
  
// Card prefix detection 

$("#cardNumber").keyup(function () {

	var types = $('#cardNumber').val();

	if (types.match(/^4/)) {
		$("#cardType").val("visa").change();
	} else if (types.match(/^50/)) {
		$("#cardType").val("master").change();
	} else if (types.match(/^55/)) {
		$("#cardType").val("master").change();
	} else if (types.match(/^34/)) {
		$("#cardType").val("amex").change();
	} else if (types.match(/^37/)) {
		$("#cardType").val("amex").change();
	} else {
		$("#cardType").val("Card Type").change();
	}
});