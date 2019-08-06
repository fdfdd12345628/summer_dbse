var chatRoomOpenList = []
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
    $(".singleChatUser").click(function(){
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
                    chatRoomOpenList.push("display_room_" + content["id"])
                    if(chatRoomOpenList.length <4) {
                        $(".chatRoomSpace").append('<div class="singleChatRoom unOpenChatRoom" id="display_room_' + content["id"] + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + content["display_name"] + '</div> <i class="material-icons singleChatRoomClose" style="float: right">close</i> </div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>')
                    }else if(chatRoomOpenList.length === 4){
                        console.log("over ")
                        $(".chatRoomSpace").append('<div class="singleChatRoom unOpenChatRoom" style="display: none" id="display_room_' + content["id"] + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + content["display_name"] + '</div> <i class="material-icons singleChatRoomClose" style="float: right">close</i> </div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>')
                        $(".chatRoomSpace").append('<div class="chatRoomOverFlow"></div>')
                    }else{
                        $('<div class="singleChatRoom unOpenChatRoom" style="display: none" id="display_room_' + content["id"] + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + content["display_name"] + '</div> <i class="material-icons singleChatRoomClose" style="float: right">close</i> </div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>').insertBefore($(".chatRoomOverFlow"))
                    }
                    getRoomMessage(content["id"])
                    $("#display_room_"+ content["id"] +" > .singleChatRoomMessageSpace").bindScrollHandler()
                    setTimeout(function () {
                        //$("#display_room_"+content["id"]).find(".singleChatRoomMessageSpace")[0].scrollTop = $("#display_room_"+content["id"]).find(".singleChatRoomMessageSpace")[0].scrollHeight
                    },50)
                    console.log("loading over")
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
    $(document).on("click",".singleExistRoom",function (e) {
        e.stopPropagation()
        if($("#display_" + this.id ).length == 0) {
            chatRoomOpenList.push("display_" + this.id)
            if(chatRoomOpenList.length <4) {
                $(".chatRoomSpace").append('<div class="singleChatRoom unOpenChatRoom" id="display_' + this.id + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + $(this).text().replace(/\s/g, "") + '</div><i class="material-icons singleChatRoomClose" style="float: right">close</i> </div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>')
            }else if(chatRoomOpenList.length == 4){
                console.log("over")
                $(".chatRoomSpace").append('<div class="singleChatRoom unOpenChatRoom" style="display: none" id="display_' + this.id + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + $(this).text().replace(/\s/g, "") + '</div> <i class="material-icons singleChatRoomClose" style="float: right">close</i> </div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>')
                $(".chatRoomSpace").append('<div class="chatRoomOverFlow"></div>')
            }else{
                $('<div class="singleChatRoom unOpenChatRoom" style="display: none" id="display_' + this.id + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + $(this).text().replace(/\s/g, "") + '</div> <i class="material-icons singleChatRoomClose" style="float: right">close</i> </div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>').insertBefore($(".chatRoomOverFlow"))
            }
            getRoomMessage(this.id.split("room_")[1])
            $("#display_"+ this.id +" > .singleChatRoomMessageSpace").bindScrollHandler()
            $("#display_"+this.id).find(".singleChatRoomMessageSpace")[0].scrollTop = $("#display_"+this.id).find(".singleChatRoomMessageSpace")[0].scrollHeight
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

    $(document).on("keypress",".singleChatRoomText",function (e) {
        if(e.which == 13) {
            if($(this).val().length > 0) {
                //console.log($(this))
                //submit form via ajax, this is not JS but server side scripting so not showing here
                $(this).parent().find(".singleChatRoomMessageSpace").append('<div class="chatRoomMessage"><div class="messageFromSelf">' + $(this).val() + '</div></div>');
                chatSocket.send(JSON.stringify({
                    'message': $(this).val(),
                    'type': 'chat',
                    'groupname': $(this).parent().attr("id").split("display_room_")[1],
                }));
                $(this).parent().find(".singleChatRoomMessageSpace")[0].scrollTop = $(this).parent().find(".singleChatRoomMessageSpace")[0].scrollHeight
            }
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


})
$(function () {
    $(document).on("click",".singleChatRoomHead", function(e){
        if($(this).parent().hasClass("unOpenChatRoom")){
            $(this).parent().removeClass("unOpenChatRoom")
            $(this).parent().addClass("openChatRoom")
            $(this).parent().find(".singleChatRoomMessageSpace").css("display","block")
            $(this).parent().find(".singleChatRoomText").css("display","block")
            $(this).parent().find(".singleChatRoomTextButton").css("display","block")
            $(this).removeClass("singleChatRoomHeadNotification")
            $(this).parent().find(".singleChatRoomMessageSpace")[0].scrollTop = $(this).parent().find(".singleChatRoomMessageSpace")[0].scrollHeight
        }else{
            $(this).parent().removeClass("openChatRoom")
            $(this).parent().addClass("unOpenChatRoom")
            $(this).parent().find(".singleChatRoomMessageSpace").css("display","none")
            $(this).parent().find(".singleChatRoomText").css("display","none")
            $(this).parent().find(".singleChatRoomTextButton").css("display","none")
        }
    })

    $(document).on("click",".singleChatRoomClose",function (e) {
        $(this).parent().parent().remove()
        chatRoomOpenList = chatRoomOpenList.filter(item => item !=$(this).parent().parent().attr("id"))
        if(chatRoomOpenList.length >=3){
            $("#"+chatRoomOpenList[2]).css("display","block")
            if(chatRoomOpenList.length == 3){
                $(".chatRoomOverFlow").remove()
            }
        }
    })
    $(document).on("keyup",".singleChatRoomText",function (e) {
        if(e.key === "Escape"){
            $(this).parent().remove()
            chatRoomOpenList = chatRoomOpenList.filter(item => item !=$(this).parent().attr("id"))
            if(chatRoomOpenList.length >=3){
                $("#"+chatRoomOpenList[2]).css("display","block")
                if(chatRoomOpenList.length == 3){
                    $(".chatRoomOverFlow").remove()
                }
            }
        }
    })

    $.fn.bindScrollHandler = function(){
        $(this).on('scroll', function(){
            if($(this).scrollTop() <=0){
                getRoomMessage($(this).parent().attr("id").split("display_room_")[1])
            }
        });
    }
})
function getRoomMessage(groupId) {
    var originRoomHeight = $("#display_room_"+groupId).find(".singleChatRoomMessageSpace")[0].scrollHeight
    setTimeout(function () {
        $.ajax({
            type: 'POST',
            url: '',
            data: {
                type: 'getRoomMessage',
                groupId : groupId,
                messageNum : $("#display_room_"+groupId).find(".chatRoomMessage").length,
                'csrfmiddlewaretoken':  csrftoken ,
            },
            dataType: 'json',
            success: function(content){
                setTimeout(function () {
                    $("#display_room_"+groupId+" > .singleChatRoomMessageSpace > .chatRoomLoadMessage").remove()
                    content["returnMessage"].forEach(function (ele) {
                        if(ele.fromUser){
                            if($("#display_room_"+groupId).find(".chatRoomMessage").length == 0 ){
                                $("#display_room_"+groupId).find(".singleChatRoomMessageSpace").append('<div class="chatRoomMessage"><div class="messageFromSelf">' + ele.content +'</div></div>')
                            }else{
                                console.log("append self message")
                                $('<div class="chatRoomMessage"><div class="messageFromSelf">' + ele.content +'</div></div>').insertBefore($("#display_room_"+groupId+" .chatRoomMessage:first-child"))
                            }
                        }else{
                            if($("#display_room_"+groupId).find(".chatRoomMessage").length == 0 ){
                                $("#display_room_"+groupId).find(".singleChatRoomMessageSpace").append('<div class="chatRoomMessage"><div class="chatRoomAvatarSpace"><img src="../static/avatar.jpg" alt="none" class="chatRoomAvatar"></div><div class="messageFromOther">'+ ele.content +'</div></div>')
                            }else{
                                $('<div class="chatRoomMessage"><div class="chatRoomAvatarSpace"><img src="../static/avatar.jpg" alt="none" class="chatRoomAvatar"></div><div class="messageFromOther">'+ ele.content +'</div></div>').insertBefore($("#display_room_"+groupId+" .chatRoomMessage:first-child"));
                            }
                        }
                    })
                    setTimeout(function () {
                        if(content["returnMessage"].length == 9){
                            $('<div class="chatRoomLoadMessage"></div>').insertBefore($("#display_room_"+ groupId+" .chatRoomMessage:first-child"));
                        }
                        $("#display_room_"+groupId).find(".singleChatRoomMessageSpace")[0].scrollTop = $("#display_room_"+groupId).find(".singleChatRoomMessageSpace")[0].scrollHeight - originRoomHeight
                    },50)
                },100)

            },
        })
    },3)

}

