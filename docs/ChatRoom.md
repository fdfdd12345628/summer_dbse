#  Chat Room  

### HTML & JS

預設 element id:  
* 聊天室 : room_{{ id }}  
* User : user_{{ id }}  
* 通知 : notification_{{ id }}

設定 *websocket*
    
    var chatSocket = new WebSocket(
        'ws://' + window.location.host +
        '/ws/chat/' + roomName + '/');
    
*websocket* 接收訊息

    chatSocket.onmessage = function (e) {}

判斷訊息類別

    var type = data['type'];
    if(type == "notification"){
        '''
            通知訊息處理
        '''
    }eles if(type == "chat"){
        '''
            聊天室訊息處理
        '''
    }
    
*websocket* 內容說明
    
    var data = JSON.parse(e.data)  
    data['message'] -> ws傳送訊息內容
    data['type'] -> ws傳送訊息類別
    data["id"] -> '通知' 在db中的id
    data["group_name"] -> '聊天'訊息發送的聊天室 id
    data["display_name"] -> '聊天'訊息發送的聊天室 名稱
    
傳送通知訊息

    document.querySelector('#notification-message-submit').onclick = function (e) {
        var messageInputDom = document.querySelector('#chat-message-input');
        var message = messageInputDom.value;
        var user_name = document.querySelector('#user-input').value;
        chatSocket.send(JSON.stringify({
            'message': message,
            'type':'notification',
			'user_name':user_name,
        }));
        messageInputDom.value = '';
    };

傳送聊天訊息

    $(document).on("keypress",".type_msg",function (e) {
        if(e.which == 13) {
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
 ## 
### Views.py ( *room* )
*GET*  
    All_Notification: 使用者目前所有通知
    All_User: 除了使用者的用戶
    All_Involved_Group: 使用者所在的聊天室

    if request.user.is_authenticated:
        userid = request.user.id
    owner = request.user
    if request.user.is_authenticated:
        All_Notification = Notification.objects.filter(to_user_id=owner)
        All_User = User.objects.exclude(id=userid)
        All_Involved_Group = Group.objects.filter(user__in=[userid])
        
    return render(request, 'chat/room.html', {
            'room_name_json': mark_safe(json.dumps(room_name)),
            'All_Notification': All_Notification,
            'All_User': All_User,
            'Self_User': owner,
            'Existed_Group': All_Involved_Group,
        })
 *POST*  
　　┌─ Clean_Seen  將通知改為已讀  
　　└─ Create_Group_Single  搜尋(創建)聊天室 
*Create_Group_Single*  

    to_user = request.POST.get("user", "")
    content = {}
    Redundant_Group = Group.objects.filter(type="single", user__in=[request.user.id]).filter(user__in=[to_user])
    if Redundant_Group.count() == 0:
        Create_Group = Group.objects.create(
            display_name=request.user.username + "_with_" + User.objects.get(id=to_user).username,
            type="single")
        Create_Group.save()
        Create_Group.user.add(request.user)
        Create_Group.user.add(User.objects.get(id=to_user))
        content["id"] = Create_Group.id
        content["display_name"] = Create_Group.display_name
        return HttpResponse(json.dumps(content))
    else:
        content["id"] = Redundant_Group.first().id
        content["display_name"] = Redundant_Group.first().display_name
        return HttpResponse(json.dumps(content))

 