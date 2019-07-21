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


$(function(){
    $(".other_user").click(function(){
        console.log(this.id.split("user_")[1])
        $.ajax({
       		type: 'POST',
       		url: '',
       		data: {
       			type: "Create_Group_Single",
       			user : this.id.split("user_")[1],
       			'csrfmiddlewaretoken': csrftoken,
       		},
       		dataType: 'json',
       		success: function(content){
				console.log("success");
				console.log(content["id"])
                if($("#display_room_" + content["id"] ).length == 0) {
                    $("#ChatRoom_Position").append('<div class="col-md-6 col-xl-6 chat" id="display_room_'+content["id"]+'"><div class="card"><i class="chatroom_close material-icons">close</i><div class="card-header msg_head"><div class="d-flex bd-highlight"><div class="img_cont"><img src="https://image.flaticon.com/icons/svg/784/784662.svg" class="rounded-circle user_img"><span class="online_icon"></span></div><div class="user_info"><span>'+content["display_name"]+'</span></div></div></div><div class="card-body msg_card_body"></div><div class="card-footer"><div class="input-group"><div class="input-group-append"><span class="input-group-text attach_btn"><i class="fas fa-paperclip"></i></span></div><textarea name="" class="form-control type_msg" placeholder="Type your message..."></textarea><div class="input-group-append"><span class="input-group-text send_btn"><i class="fas fa-location-arrow"></i></span></div></div></div></div></div>')
                }
       		},
        })
    })
    /******
    { one to one chat }
    點擊聊天室 USER 時觸發
    first: Post to query if group is exist (if not, create t) : return group id
    Second: check if room already existed
           if not, append chat room in "ChatRoom_Position"
    Usage:
        聊天室中 user 的 id 為 user_{{ model中 user 的id}}
        改變前端
           將append內容改變
           id: display_room_{{ model中 group 的id }}
           後方span處 填入 {{ model中 group 的display_name }}
    ******/
    $(".exist_room").click(function(){
        console.log(this.id)
        if($("#display_" + this.id ).length == 0) {
            $("#ChatRoom_Position").append('<div class="col-md-6 col-xl-6 chat" id="display_'+this.id+'"><div class="card"><i class="chatroom_close material-icons">close</i><div class="card-header msg_head"><div class="d-flex bd-highlight"><div class="img_cont"><img src="https://image.flaticon.com/icons/svg/784/784662.svg" class="rounded-circle user_img"><span class="online_icon"></span></div><div class="user_info"><span>'+$("#"+this.id).find(".user_info > span").text()+'</span></div></div></div><div class="card-body msg_card_body"></div><div class="card-footer"><div class="input-group"><div class="input-group-append"><span class="input-group-text attach_btn"><i class="fas fa-paperclip"></i></span></div><textarea name="" class="form-control type_msg" placeholder="Type your message..."></textarea><div class="input-group-append"><span class="input-group-text send_btn"><i class="fas fa-location-arrow"></i></span></div></div></div></div></div>')
        }
    })
    /******
    { one to one chat }
    { 等 one to many 可創建也同樣方式}
    點擊聊天室 Group 時觸發
    Usage:
        聊天室中 group 的 id 為 room_{{ model 中 group的id}}
        改變前端
           將append內容改變
           id: display_{{this.id}}
           後方span處 填入 {{ this中找到display_name }}
    ******/

    $(document).on("keypress",".type_msg",function (e) {
        if(e.which == 13) {
            console.log($(this))
            //submit form via ajax, this is not JS but server side scripting so not showing here
            $(this).parent().parent().parent().find(".msg_card_body").append($(this).val() + "<br/>");
            chatSocket.send(JSON.stringify({
                'message': $(this).val(),
                'type':'chat',
                'groupname': $(this).parent().parent().parent().parent().attr("id").split("display_room_")[1],
            }));
            var $this = $(this)
            setTimeout(function(){ $this.val("") }, 3);
        }
    });
    /******
    當在聊天室中輸入完成 並按下enter 即可傳送
    使用chatsocket (已在room.html中定義)
    Usage:
        message: 欲傳送訊息
        type: 判斷ws是通知或是聊天訊息
        groupname: 判斷ws傳送對象 ( "group" )
        {因 通知對人 聊天對聊天室}
    ******/
    $(document).on("click",".chatroom_close",function (e) {
        $(this).parent().parent().remove()
    })
})

