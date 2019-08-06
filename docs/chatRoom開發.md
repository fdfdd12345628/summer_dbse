[回上一頁](../文件導覽.md)  

import 套件

	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
	<link href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
	<script src="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js"></script>

聊天室基本html

    <div class="chatRoomList">
        <div class="chatRoomListSelf"></div>
        <div class="existRoomList"></div>
        <div class="existAllUser"></div>
    </div>
    <div class="chatRoomSpace"></div>
    
    
修改前端設定 ( 顏色大小等等 )  請修改room.css中設定  
!!!!不建議更改辣度和自行調整!!!!

Class 介紹  

**聊天視窗**  
*chatRoomSpace* : 聊天視窗位置  
*singleChatRoom* : 單一聊天視窗  
*unOpenChatRoom* , *openChatRoom* : 聊天視窗展開前後  
*singleChatRoomHead* : 聊天視窗上半部  
*singleChatRoomHeadNotification* : 聊天視窗(通知)  

**訊息**  
*singleChatRoomMessageSpace* : 訊息擺放位置  
*chatRoomMessage ,messageFromSelf ,messageFromOther* : 各則訊息  

**聊天室**  
*chatRoomListSelf* : 聊天室 ＞ 本身資訊  
*existRoomList* : 現有聊天群組  
*.singleExistRoom, .singleChatUser* : 現有聊天群組與其他用戶



  
[回上一頁](../文件導覽.md)  