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

$(".proxCover").click(function() {

if($('#usapb').is(':checked'))
{
  $("#usap").addClass("prox-sel");
} else {
  $("#usap").removeClass("prox-sel");
}

if($('#ukpb').is(':checked'))
{
  $("#ukp").addClass("prox-sel");
} else {
  $("#ukp").removeClass("prox-sel");
}

if($('#depb').is(':checked'))
{
  $("#dep").addClass("prox-sel");
} else {
  $("#dep").removeClass("prox-sel");
}

if($('#espb').is(':checked'))
{
  $("#esp").addClass("prox-sel");
} else {
  $("#esp").removeClass("prox-sel");
}

if($('#frpb').is(':checked'))
{
  $("#frp").addClass("prox-sel");
} else {
  $("#frp").removeClass("prox-sel");
}

if($('#rupb').is(':checked'))
{
  $("#rup").addClass("prox-sel");
} else {
  $("#rup").removeClass("prox-sel");
}

if($('#chinapb').is(':checked'))
{
  $("#chinap").addClass("prox-sel");
} else {
  $("#chinap").removeClass("prox-sel");
}

if($('#aupb').is(':checked'))
{
  $("#aup").addClass("prox-sel");
} else {
  $("#aup").removeClass("prox-sel");
}
});
