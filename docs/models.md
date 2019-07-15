# models.py

## Group
聊天群組  
 `user` : 在群組裡的使用者  
 `display_name` : 群組名稱  
 `type` : 群組為私聊還是群聊  

## Notification
通知  
`from_user`:寄送者  
`to_user`:接收者  
`content`:內文  
`date`:寄送日期  
`seen`:是否已讀  

## Message
訊息  
`from_user`:寄送者  
`to_group`:接收群組  
`content`:內文  
`date`:寄送日期  
`seen`:誰已讀  

## Clients
當前使用者有連結多少個websocket  
`user`:當前使用者  
`layer`:websocket的id  

## User
`ukey` :指紋辨識中產生的ukey    
`credential_id` :指紋辨識認證  
`display_name` :webauthn中顯示名稱   
`pub_key` :webauthn中儲存public key  
`sign_count` :登入次數  
`rp_id` :relying party ID  
`icon_url` :NONE  

