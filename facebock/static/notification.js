function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');
/******
 for csrf token
 *******/
function change_to_none_notification(){
    // change notification icon
    $("#notification_icon").removeClass("Notification");
    $("#notification_icon").addClass("None_Notification");
}
function change_to_notification(){
    // change notification icon
    $("#notification_icon").addClass("Notification");
    $("#notification_icon").removeClass("None_Notification");
}
/******
 change notification icon image
 Usage:
 Change icon's id
 Change icon's background-image in static/room.css
 ******/

function add_red_point(id){
    // 新增通知數目
    if(parseInt($("#"+id).text())==0){
        // 原數目為0不顯示小紅點 故新增時將其 icon,小紅點更改顯示
        change_to_notification();
        $("#"+id).css("display","inline-block")
    }
    $("#"+id).text((parseInt($("#"+id).text())+1).toString())
    //增加數目
}
/******
 Usage:
 put <span class="redpoint" id="notification_redpoint">0</span> in notification icon's div
 ******/

function seen_notification(id){
    //查看通知時，將icon轉換 並將db中通知狀態改變
    change_to_none_notification();
    // change icon
    $("#"+id).css("display","none");
    $("#"+id).text("0");
    clean_seen();
    //-- ajax post to views.py and change state of notification's status (0 -> 1)
}
/******
 id => notification icon's id
 ******/
function clean_seen(){
    var ids = $('.list-group-item-primary').map(function() {
        return $(this).attr('id').split("notification_")[1];
    }).toArray();
    $.ajax({
        type: 'POST',
        url: '',
        data: {
            type: "Clean_Seen",
            seen_id : ids,
            'csrfmiddlewaretoken':  csrftoken ,
        },
        dataType: 'json',
        success: function(content){
            console.log("success");
        },
    })
}
/******
 將database中標示未讀者改為已讀
 ids: parse class中有.list-group-item-primary (未讀) 記錄成array
 ******/



var notification_list_state=0
//紀錄是否被點開 為了改變icon狀態
$(function(){
    $("#notification_icon").on("click",function(){
        if(notification_list_state ==0){
            //icon 原本未被點開
            seen_notification("notification_redpoint");
            //查看通知
            $("#notification_list_group").css("display","flex");
            notification_list_state = 1;
            //展開list 並更改var
        }else{
            //原本被打開
            $("#notification_list_group").css("display","none");
            notification_list_state = 0;
            //收起list並更改var
            $("#notification_list_group").find(".list-group-item-primary").removeClass("list-group-item-primary")
            //當收起時改變未讀list的狀態為已讀
        }
    });
});
