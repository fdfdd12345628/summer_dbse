#WebSocket 
ws前端傳送與接受的使用方式  
*WS需先行連接*  

    var chatSocket = new WebSocket(
			'wss://'+url);
			
## 通知系統
####傳送
    
    chatSocket.send(JSON.stringify({
			'message': [傳送訊息],
			'type':'notification',
			'user_name': [傳送對象username],
		}));
		
####接收  
 
    chatSocket.onmessage = function (e) {
		var data = JSON.parse(e.data);
		var message = data['message']; <- 傳送的訊息
		var type = data['type'];
		if(type == "notification"){
		    [To Do]
		}
	
## 聊天室
#### 傳送  
    chatSocket.send(JSON.stringify({
        'message': [傳送訊息],
        'type': 'chat',
        'chatType': 'text',
        'groupname': [傳送聊天室id],
    }));
####接收
    chatSocket.onmessage = function (e) {
		var data = JSON.parse(e.data);
		var message = data['message']; <- 傳送的訊息
		var type = data['type'];
        if(type == "chat"){
			if(data['from_user'] != "{{ request.user.username }}"){
			    [To Do]
			}
		}
    }
    
