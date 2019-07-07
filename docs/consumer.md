# Consumer.py程式解釋

## channel_layer解釋
由於每個websocket之間不互通，因此藉由layer來連結，可以將各個websocket加入group。之後就可以送訊息到指定的websocket或是group。

## connect
此為websocket連結時執行的程式，會將登入的使用者與此websocket連結，方便之後可以送給特定使用者。
```python
await self.add_clients()
```    

之後會將此websocket加入一個名子是username的group，之後可以直接用username送訊息。
```python
await self.channel_layer.group_add(
    self.user_name,
    self.channel_name,
)
```
    

## disconnect
此為websocket在關閉時做的動作，將此websocket從layer中移除
```python
await self.channel_layer.group_discard(
    self.user_name,
    self.channel_name,
)    
```
    
並且將此websocket與user的連結移除
```python
await self.delete_client()
```

## receive
當此websocket收到前端的訊息要做的事情，主要分成notification與message兩種
* #### message
此時的`cate`是`chat`，我們會將訊息送到聊天室所有的user的websocket

    total_channel = await self.get_all_user_layer(group_name=groupname)
        for channel in total_channel:
            await self.channel_layer.send(
                channel,
                {
                    'type': 'chat_message',
                    'message': message,
                    'cate': cate,
                    'group_name': groupname,
                    'from_user': self.user
                }
            )

並且將message存進資料庫

    await self.put_message(
        group_id=groupname,
        from_user=self.user,
        text=message,
    )

* ####notification
此時的`cate`是`notification`，會先將訊息存進資料庫

    notification = await self.put_notification(text=message,
                                               from_user=self.user.username,
                                               to_user=user_name)


並將訊息送到目標user的websocket
    
    await self.channel_layer.group_send(
        user_name,
        {
            'type': 'notification_message',
            'message': message,
            'cate': cate,
            'from_user': self.user,
            'id': notification.id
        }
    )

## chat_message
當收到來自layer且`'type': 'chat_message'`的訊息，會呼叫這個程式
收到聊天室訊息後，會送給前端訊息的內容

```python
await self.send(text_data=json.dumps({
    'type': 'chat',
    'group_name': event['group_name'],
    'display_name': group.display_name,
    'message': message,
    'from_user': event['from_user'].username,
    'date': now.__str__()
}))
```

##  notification_message
當收到來自layer且`'type': 'notification_message'`的訊息，會呼叫這個程式
收到通知後，會送給前端通知的內容

```python
await self.send(text_data=json.dumps({
    'type': 'notification',
    'message': message,
    'from_user': event['from_user'].username,
    'date': str(now),
    'id': event['id'].id,
}))
```
