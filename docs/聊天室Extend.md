####Template Extends  
原先room.html 分為兩部分: 聊天功能、通知系統  
聊天功能： roomChat.html  、 views.py -> room  
通知系統： roomNotification.html 、 views.py -> room   
####template:
兩者皆使用3個block: 
    
    {% block head %}{% endblock %}
    {% block content %}{% endblock %}
    {% block js %}{% endblock %}

使用到的 cdn 包含:  
 - jquery.min.js : 3.4.1
 - bootstrap.min.css : 4.1.1
 - google icon
 
其中bootstrap 主要借用其字型和部分default屬性 

####views:
皆包含在def room(request)  
 - 聊天功能：  
     - Get: 需要回傳的content:
     
            All_User = User.objects.exclude(id=userid)
            All_Involved_Group = Group.objects.filter(user__in=[userid])
            for group in All_Involved_Group:
                group.display_name = group.display_name.replace(request.user.username,'').replace("_with_","") 
            content = {
                'room_name_json': 'chat',
                'All_User': All_User,
                'Self_User': owner,
                'Existed_Group': All_Involved_Group,
            })
     - Post:
     
            if request.POST.get("type", "") == "Create_Group_Single":
                ...
            elif request.POST.get("type","") == 'Create_Group_Multiple':
                ...
            elif request.POST.get("type", "") == "getRoomMessage":
                ...
 - 通知功能：
     - Get: 需要回傳的content:
     
            All_Notification = Notification.objects.filter(to_user_id=owner)
            content = {
                'All_Notification': All_Notification,
            }
     - Post:         
     
            if request.POST.get("type", "") == "Clean_Seen":
                ...
            