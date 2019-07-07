# Deploying

## 修改Django設定

安裝 *channels*
	
    pip install -U channels
    
將 *channels* 加入 *INSTALLED_APPS* 內

	INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    ...
    'channels',
	)
    
在settings.py加入下列屬性

	ASGI_APPLICATION = "myproject.routing.application" # change myproject to your project name
    
在wsgi.py的資料夾內，加入asgi.py

	"""
    myproject/asgi.py
	ASGI entrypoint. Configures Django and then runs the application
	defined in the ASGI_APPLICATION setting.
	"""

	import os
	import django
	from channels.routing import get_default_application

	os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
	django.setup()
	application = get_default_application()
    
在 `settings.py` 的目錄下，加入 `routing.py`，內容如 `facebock/routing.py`
安裝教學 <https://channels.readthedocs.io/en/latest/installation.html>

## 修改User
在 `models.py`
```python
from django.db import models
from django.contrib.auth.models import User
```

在 `views.py`
```python
...
import json
from django.contrib.auth.models import User
```

在consumers.py
```python
...
from django.contrib.auth.models import User
...
```
將以上這幾個改成客製的User

## 設定nginx

加入 *upstream*

	upstream channels-backend {
    	server localhost:8000;
        # or using unix socket
        # server unix:/tmp/stream.sock;
	}
	...
	server {
      ...
    	location / {
        	try_files $uri @proxy_to_app;
    	}
      ...
    	location @proxy_to_app {
        	proxy_pass http://channels-backend;

            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            proxy_redirect off;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Host $server_name;
            }
      ...
	}

## 使用daphne開啟django


切換到project的根目錄，執行daphne
	
    daphne -b 0.0.0.0 -p 8001 myproject.asgi:application

其中 -b 與 -p 可以分別綁定address與port
如果用unix socket，則是使用 -u

	daphne -u /tmp/stream.sock myproject.asgi:application
    
也可以用工具自動執行daphne（例如supervisor等等）

部屬教學 <https://channels.readthedocs.io/en/latest/deploying.html>

## 其餘參考資料
1. daphne <https://github.com/django/daphne>
2. channels <https://channels.readthedocs.io>

---
