[回上一頁](../文件導覽.md)  

1. 將websocket路徑從 [http://<對內host>:<對內port>/ws]() 改成 [http://<對內host>:<對內port>/websocket]()  
關聯檔案有  
    * facebock\template\chat\room.html 的 
    ```
    var chatSocket = new WebSocket(
        'wss://' + window.location.host +
        '/websocket/chat/' + roomName + '/');
    ```

    * facebock\chat\routing.py 的  
    ```  
    path('websocket/chat/<room_name>/', consumers.ChatConsumer),
    ```  
    這裡也順便把正規表示的格式改成Django新版的url dispatcher寫法

2. 2019/8/8
已經將websocket的url改動，並且根據學長的doc寫法，一些文件增加了描述：  
- consumer.md增加了websocket連線流程圖
- deploying.md對部屬的部分描寫更詳細
- 修正requirement.txt錯誤
  
[回上一頁](../文件導覽.md)  

