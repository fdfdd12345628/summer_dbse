$(document).ready(function(){
    $('#action_menu_btn').click(function(){
	    $('.action_menu').toggle();
    });
});
function change_to_none_notification(){
    $("#notification_icon").removeClass("Notification");
    $("#notification_icon").addClass("None_Notification");
}
function change_to_notification(){
    $("#notification_icon").addClass("Notification");
    $("#notification_icon").removeClass("None_Notification");
}
function add_red_point(id){
    if(parseInt($("#"+id).text())==0){
        change_to_notification();
        $("#"+id).css("display","inline-block")
    }
    $("#"+id).text((parseInt($("#"+id).text())+1).toString())
}
function seen_notification(id){
    change_to_none_notification();
    $("#"+id).css("display","none");
    $("#"+id).text("0");
}
