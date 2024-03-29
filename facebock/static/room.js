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
                if($("#display_room_" + content["id"] ).length == 0) {
                    chatRoomOpenList.push("display_room_" + content["id"])
                    if(chatRoomOpenList.length <4) {
                        $(".chatRoomSpace").append('<div class="singleChatRoom unOpenChatRoom" tabindex="0" id="display_room_' + content["id"] + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + content["display_name"] + '</div> <div class="singleChatRoomIconSpace"><i class="material-icons singleChatRoomVideoCam">videocam</i><i class="material-icons singleChatRoomClose" >close</i></div> </div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>')
                    }else if(chatRoomOpenList.length === 4){
                        $(".chatRoomSpace").append('<div class="singleChatRoom unOpenChatRoom" tabindex="0" style="display: none" id="display_room_' + content["id"] + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + content["display_name"] + '</div> <div class="singleChatRoomIconSpace"><i class="material-icons singleChatRoomVideoCam">videocam</i><i class="material-icons singleChatRoomClose" >close</i></div> </div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>')
                        $(".chatRoomSpace").append('<div class="chatRoomOverFlow"><div class="chatRoomOverFlowList"></div></div>')
                        overFlowRoom(content["display_name"],"display_room_"+content["id"])
                    }else{
                        $('<div class="singleChatRoom unOpenChatRoom" tabindex="0" style="display: none" id="display_room_' + content["id"] + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + content["display_name"] + '</div> <div class="singleChatRoomIconSpace"><i class="material-icons singleChatRoomVideoCam">videocam</i><i class="material-icons singleChatRoomClose" >close</i></div></div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>').insertBefore($(".chatRoomOverFlow"))
                        overFlowRoom(content["display_name"],"display_room_"+content["id"])
                    }
                    getRoomMessage(content["id"])
                    $("#display_room_"+ content["id"] +" > .singleChatRoomMessageSpace").bindScrollHandler()
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
                $(".chatRoomSpace").append('<div class="singleChatRoom unOpenChatRoom"  tabindex="0" id="display_' + this.id + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + $(this).text().replace(/\s/g, "") + '</div><div class="singleChatRoomIconSpace"><i class="material-icons singleChatRoomVideoCam">videocam</i><i class="material-icons singleChatRoomClose" >close</i></div> </div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>')
            }else if(chatRoomOpenList.length == 4){
                console.log("over")
                $(".chatRoomSpace").append('<div class="singleChatRoom unOpenChatRoom" tabindex="0" style="display: none" id="display_' + this.id + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + $(this).text().replace(/\s/g, "") + '</div> <div class="singleChatRoomIconSpace"><i class="material-icons singleChatRoomVideoCam">videocam</i><i class="material-icons singleChatRoomClose" >close</i></div></div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>')
                $(".chatRoomSpace").append('<div class="chatRoomOverFlow"><div class="chatRoomOverFlowList"></div></div>')
                overFlowRoom($(this).text().replace(/\s/g, ""),"display_"+this.id)
            }else{
                $('<div class="singleChatRoom unOpenChatRoom" tabindex="0" style="display: none" id="display_' + this.id + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + $(this).text().replace(/\s/g, "") + '</div><div class="singleChatRoomIconSpace"><i class="material-icons singleChatRoomVideoCam">videocam</i><i class="material-icons singleChatRoomClose" >close</i></div> </div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>').insertBefore($(".chatRoomOverFlow"))
                overFlowRoom($(this).text().replace(/\s/g, ""),"display_"+this.id)
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
                    'chatType': 'text',
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

    $(document).on("click",".singleChatRoomTextButton",function (e) {
        var $this = $(this).parent().find(".singleChatRoomText")
        if($this.val().length>0){
            $this.parent().find(".singleChatRoomMessageSpace").append('<div class="chatRoomMessage"><div class="messageFromSelf">' + $this.val() + '</div></div>');
            chatSocket.send(JSON.stringify({
                'message': $this.val(),
                'type': 'chat',
                'chatType': 'text',
                'groupname': $this.parent().attr("id").split("display_room_")[1],
            }));
            $this.parent().find(".singleChatRoomMessageSpace")[0].scrollTop = $this.parent().find(".singleChatRoomMessageSpace")[0].scrollHeight
        }
        setTimeout(function(){ $this.val("") }, 3);
    })

})
$(function () {
    $(document).on("click",".singleChatRoomHead", function(e){
        if($(this).parent().hasClass("unOpenChatRoom")){
            $(this).parent().removeClass("unOpenChatRoom")
            $(this).parent().addClass("openChatRoom")
            $(this).parent().find(".singleChatRoomMessageSpace").css("display","block")
            $(this).parent().find(".singleChatRoomText").css("display","block")
            $(this).parent().find(".singleChatRoomTextButton").css("display","block")
            $(this).parent().find(".singleChatRoomVideoCam").css("display","inline-block")
            $(this).removeClass("singleChatRoomHeadNotification")
            $(this).parent().find(".singleChatRoomMessageSpace")[0].scrollTop = $(this).parent().find(".singleChatRoomMessageSpace")[0].scrollHeight
        }else{
            $(this).parent().removeClass("openChatRoom")
            $(this).parent().addClass("unOpenChatRoom")
            $(this).parent().find(".singleChatRoomMessageSpace").css("display","none")
            $(this).parent().find(".singleChatRoomText").css("display","none")
            $(this).parent().find(".singleChatRoomTextButton").css("display","none")
            $(this).parent().find(".singleChatRoomVideoCam").css("display","none")
        }
    })

    /*
     * Call video cam
     */
    $(document).on("click",".singleChatRoomVideoCam",function (e) {
        //$("body").append('<div class="modalBackground"><div class="videoCamModal"><img src="https://image.flaticon.com/icons/svg/181/181549.svg" alt=""><div class="modalIconSpace"></divc><i class="material-icons modalCallIcon">call</i><i class="material-icons modalEndIcon">call_end</i></div></div></div>')
        /*
        console.log($(this).parent().parent().parent().attr("id"))
         */
        var randomVideoChat = makeid(15)
            $("body").append('<div class="modalBackground"><iframe src="../rtc/'+ randomVideoChat +'" frameborder="0" style="position: absolute; top: 10%;left: 10%; height:80%; width:80%; background:black;"></iframe><i class="material-icons videoClose" >close</i></div>')
        /*
        var win = window.open("../rtc/"+randomVideoChat, '_blank');
        win.focus();
         */
        chatSocket.send(JSON.stringify({
            'type': 'chat',
            'chatType': 'videoAsk',
            'videoChat': randomVideoChat,
            'groupname': $(this).parent().parent().parent().attr("id").split("display_room_")[1],
        }));
    })
    /*
    * accept Call
    */
    $(document).on("click",".modalCallIcon",function (e) {
        console.log("accept")
        var randomString = $(this).parent().parent().attr("id").split("modal_")[1]
        setTimeout(function () {
            /*
            var win = window.open("../rtc/"+randomString, '_blank');
            win.focus();
             */
            $("body").append('<div class="modalBackground"><iframe src="../rtc/'+ randomString +'" frameborder="0" style="position: absolute; top: 10%;left: 10%; height:80%; width:80%; background:black;"></iframe><i class="material-icons videoClose" >close</i></div>')
        },50)
        $(this).parent().parent().parent().remove()
    })
    /*
     * reject Call
     */
    $(document).on("click",".modalEndIcon",function (e) {
        $(this).parent().parent().parent().remove()
    })

    $(document).on("click",".videoClose",function (e) {
        $(this).parent().remove()
    })


    $(document).on("click",".singleChatRoomClose",function (e) {
        $(this).parent().parent().parent().remove()
        chatRoomOpenList = chatRoomOpenList.filter(item => item !=$(this).parent().parent().parent().attr("id"))
        if(chatRoomOpenList.length >=3){
            $("#"+chatRoomOpenList[2]).css("display","block")
            if(chatRoomOpenList.length == 3){
                $(".chatRoomOverFlow").remove()
            }
        }
    })

    // 按esc離開聊天視窗
    $(document).on("keyup",".singleChatRoomText , .singleChatRoom",function (e) {
        if(e.key === "Escape"){
            if($(this).hasClass("singleChatRoomText")){
                $(this).parent().remove()
                chatRoomOpenList = chatRoomOpenList.filter(item => item !=$(this).parent().attr("id"))
                if(chatRoomOpenList.length >=3){
                    $("#"+chatRoomOpenList[2]).css("display","block")
                    if(chatRoomOpenList.length == 3){
                        $(".chatRoomOverFlow").remove()
                    }
                }
            }else{
                $(this).remove()
                chatRoomOpenList = chatRoomOpenList.filter(item => item != $(this).attr("id"))
                if(chatRoomOpenList.length >=3){
                    $("#"+chatRoomOpenList[2]).css("display","block")
                    if(chatRoomOpenList.length == 3){
                        $(".chatRoomOverFlow").remove()
                    }
                }
            }
        }
    })

    /*
        close create new room modal
     */
    $(document).on("click",".createNewRoomClose",function (e) {
        $(this).parent().parent().remove()
    })

    /*
        choose people to new room
     */
    $(document).on("change",".newRoomUserOption",function (e) {
        console.log($(this).attr("name"))
        if($(this).is(":checked")){
            $(".userChosen").append('<div class="singleUserChosen" id="userChosen_'+$(this).attr("name")+'"><span>'+$(this).attr("name")+'</span><i class="material-icons singleUserChosenClose" >close</i></div>')
        }else{
            $("#userChosen_"+$(this).attr("name")).remove()
        }
        if ($(".userChosen").find(".singleUserChosen").length >=2){
            $(".newRoomModalSend").removeAttr('disabled')
        }else{
            $(".newRoomModalSend").attr("disabled","disabled")
        }
    })

    /*
        show close when hover on singleUserChosen
    */
    $(document).on("mouseenter",".singleUserChosen",function (e) {
        $(this).find(".singleUserChosenClose").css("display","block")
    })
    $(document).on("mouseleave",".singleUserChosen",function (e) {
        $(this).find(".singleUserChosenClose").css("display","none")
    })

    /*
        delete chosen user in create new room
     */
    $(document).on("click",".singleUserChosenClose", function (e) {
        $(this).parent().remove()
        $(".allUserForchoose").find("input[name="+$(this).parent().find("span").text()+"]").prop("checked",false)

    })
    $(document).on("keyup",".createNewRoomModal",function(e){
       if(e.key === "Escape"){
           $(".modalBackground").remove()
       }
    })
    /*
        create new room send out
     */
    $(document).on("click",".newRoomModalSend",function (e) {
        if(!$("#roomNameSpace").val()){
            alert("請輸入群組名稱")
        }else{
            var chosenUserName = []
            $(this).parent().find(".createNewRoomPeople").find(".userChosen").find(".singleUserChosen").each(function () {
                chosenUserName.push($(this).find("span").text())
            })
            $.ajax({
            type: 'POST',
            url: '',
            data: {
                type: "Create_Group_Multiple",
                user : chosenUserName,
                displayName :$("#roomNameSpace").val(),
                'csrfmiddlewaretoken': csrftoken,
            },
            dataType: 'json',
            success: function(content){
                if($("#display_room_" + content["id"] ).length == 0) {
                    chatRoomOpenList.push("display_room_" + content["id"])
                    if(chatRoomOpenList.length <4) {
                        $(".chatRoomSpace").append('<div class="singleChatRoom unOpenChatRoom" tabindex="0" id="display_room_' + content["id"] + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + content["display_name"] + '</div> <div class="singleChatRoomIconSpace"><i class="material-icons singleChatRoomVideoCam">videocam</i><i class="material-icons singleChatRoomClose" >close</i></div> </div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>')
                    }else if(chatRoomOpenList.length === 4){
                        $(".chatRoomSpace").append('<div class="singleChatRoom unOpenChatRoom" tabindex="0" style="display: none" id="display_room_' + content["id"] + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + content["display_name"] + '</div> <div class="singleChatRoomIconSpace"><i class="material-icons singleChatRoomVideoCam">videocam</i><i class="material-icons singleChatRoomClose" >close</i></div> </div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>')
                        $(".chatRoomSpace").append('<div class="chatRoomOverFlow"><div class="chatRoomOverFlowList"></div></div>')
                        overFlowRoom(content["display_name"],"display_room_"+content["id"])
                    }else{
                        $('<div class="singleChatRoom unOpenChatRoom" tabindex="0" style="display: none" id="display_room_' + content["id"] + '"> <div class="singleChatRoomHead"><div class="singleChatRoomHeadName"> ' + content["display_name"] + '</div> <div class="singleChatRoomIconSpace"><i class="material-icons singleChatRoomVideoCam">videocam</i><i class="material-icons singleChatRoomClose" >close</i></div></div> <div class="singleChatRoomMessageSpace"> </div> <textarea class="singleChatRoomText"></textarea><button class="singleChatRoomTextButton"></button></div>').insertBefore($(".chatRoomOverFlow"))
                        overFlowRoom(content["display_name"],"display_room_"+content["id"])
                    }
                    //getRoomMessage(content["id"])
                    //$("#display_room_"+ content["id"] +" > .singleChatRoomMessageSpace").bindScrollHandler()
                }
                $(".existRoomList").append('<div class="singleExistRoom" id="room_'+content['id']+'}"><img src="https://image.flaticon.com/icons/svg/784/784662.svg" alt="none"> '+content['display_name']+'</div>')
                $(".modalBackground").remove()
            },
        })
        }

    })

    //設定dynamic element 可以使用scroll event
    //拉到頂部讀取更舊訊息
    $.fn.bindScrollHandler = function(){
        $(this).on('scroll', function(){
            if($(this).scrollTop() <=0){
                getRoomMessage($(this).parent().attr("id").split("display_room_")[1])
            }
        });
    }
})
//聊天室訊息讀取
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
                            //訊息屬於自己
                            if($("#display_room_"+groupId).find(".chatRoomMessage").length == 0 ){
                                $("#display_room_"+groupId).find(".singleChatRoomMessageSpace").append('<div class="chatRoomMessage"><div class="messageFromSelf">' + ele.content +'</div></div>')
                            }else{
                                console.log("append self message")
                                $('<div class="chatRoomMessage"><div class="messageFromSelf">' + ele.content +'</div></div>').insertBefore($("#display_room_"+groupId+" .chatRoomMessage:first-child"))
                            }
                        }else{
                            if($("#display_room_"+groupId).find(".chatRoomMessage").length == 0 ){
                                $("#display_room_"+groupId).find(".singleChatRoomMessageSpace").append('<div class="chatRoomMessage"><div class="chatRoomAvatarSpace"><a href="#" title ="'+ele.fromUserName+'"><img src="../static/avatar.jpg"  alt="" class="chatRoomAvatar"></a></div><div class="messageFromOther">'+ ele.content +'</div></div>')
                            }else{
                                $('<div class="chatRoomMessage"><div class="chatRoomAvatarSpace"><a href="#" title ="'+ele.fromUserName+'"><img src="../static/avatar.jpg"  alt="none" class="chatRoomAvatar"></a></div><div class="messageFromOther">'+ ele.content +'</div></div>').insertBefore($("#display_room_"+groupId+" .chatRoomMessage:first-child"));
                            }
                        }
                    })
                    setTimeout(function () {
                        //過往訊息讀取完畢
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

/******
 * < 設定scroll位置 >
 * $(ele).find(".singleChatRoomMessageSpace")[0].scrollTop = $(ele).find(".singleChatRoomMessageSpace")[0].scrollHeight
 *
 * < 插入content >
 * $(content).insertBefore(插入ele)
 *
 * < 確認是否存在（被創建） >
 * $(parent).find(id).length == 0
 ******/
Notification.requestPermission()
function notify(message) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(message);
    }
}

/*
* create random string
*/
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

/*
Create New Room
 */
function createNewRoom() {
   console.log("createNewRoom")
    $("body").append('<div class="modalBackground"><div class="createNewRoomModal" tabindex="0"><i class="material-icons createNewRoomClose" >close</i><h2><i>Create New Room</i></h2><div class="createNewRoomName"><img src="https://image.flaticon.com/icons/svg/1250/1250925.svg" alt="none"><textarea name="roomName" id="roomNameSpace" cols="30" rows="1" placeholder="輸入新群組名稱"></textarea></div><div class="createNewRoomPeople"><div class="allUserForchoose"></div><div class="userChosen"></div></div><button class="newRoomModalSend" disabled>確認</button></div></div>')
    for(var i in allUser){
        $(".allUserForchoose").append('<label><input type="checkbox" class="newRoomUserOption" name="'+allUser[i]+'" value="'+allUser[i]+'"> '+allUser[i]+'</label><br>')
    }
    $("#roomNameSpace").focus()
}

function overFlowRoom(roomName,id) {
    $(".chatRoomOverFlowList").append('<div class="overFlowRoom" id="over_'+id+'"><span>'+roomName+'</span></div>')

}
function switchOverFlowRoom(roomId){
    var overFlowRoomList = $(".singleChatRoom").filter(function () {
        var ele = $(this)
        if(ele.css('display') == 'none'){
            return false
        }else{
            return true
        }
    })
    overFlowRoomList.eq(-1).css("display","none")
    $("#"+roomId).css("display","block")
    if($("#"+roomId).hasClass("unOpenChatRoom")){
        $("#"+roomId).find(".singleChatRoomHead").trigger("click")
    }
    overFlowRoom(overFlowRoomList.eq(-1).find(".singleChatRoomHead").find(".singleChatRoomHeadName").text().replace(/\s/g, ""),overFlowRoomList.eq(-1).attr("id"))
}

$(function () {
    $(document).on("click",".chatRoomOverFlow",function (e) {
        if($(this).find(".chatRoomOverFlowList").css("display") == "none"){
            $(".chatRoomOverFlowList").css("display","inline-block")
        }else{
            $(".chatRoomOverFlowList").css("display","none")
        }
    })

    $(document).on("click",".overFlowRoom",function (e) {
        $(this).remove()
        switchOverFlowRoom($(this).attr("id").split("over_")[1])
    })
})