[回上一頁](../文件導覽.md)  
  
# 產生自己的SSL簽證

1. 到[Openssl官方網站](https://slproweb.com/products/Win32OpenSSL.html)下載[安裝檔](https://slproweb.com/download/Win64OpenSSL-1_1_0k.exe)

2. 安裝Openssl

3. 在Facebok project資料夾下執行powershell並依序使用以下指令建立簽證檔

    1. openssl genrsa -out /ssl/server.key 2048  

    2. openssl req -new -key server.key -out server.csr  

    3.  openssl x509 -req -days 36500 -sha256 -extensions v3_ca -signkey server.key -in server.csr -out server.crt

4. 最後會在Facebok project資料夾出現 server.key server.csr server.crt 等三個檔案


# Windows版Nginx的安裝

1. 到[官方網站](http://nginx.org/en/download.html)下載[安裝檔](http://nginx.org/download/nginx-1.16.0.zip)

2. 安裝Nginx到指定路經

3. 打開 [Nginx安裝路徑/conf/nginx.conf]() 做congiguration

4. nginx.conf conf中預設的伺服器是HTTP不是HTTPS  
因此把http {...}下的server {...}的段落註解起來

5. 在http {...}下新增的server {}的段落 作為HTTPS伺服器設定  
並設定對外的host<span style="color:rgba(0,255,0,0.4)">(i.e. server_name)</span>與port<span style="color:rgba(0,255,0,0.4)">(i.e. listen)</span>  
　  
server {}的段落下新增：
```
listen       <對外port> ssl;
server_name  <對外host>;

```

6. 加上ssl設定，並透過絕對路徑指定SSL的key與crt檔  
　  
server {}的段落下新增：  
```
ssl_certificate      <...>\facebok\server.crt;
ssl_certificate_key  <...>\facebok\server.key;

ssl_session_cache    shared:SSL:1m;
ssl_session_timeout  5m;

ssl_ciphers  HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers  on;

```

7. 設定一般情況時，從HTTPS跳轉到Daphne的HTTP  
如此就能透過 [https://<對外host>:<對外port>/<...>]()  
轉接到Daphne的 [http://<對內host>:<對內port>/<...>]()  
　  
server {}的段落下新增：  
```
location / {
    proxy_pass http://<對內port>:<對內port>/;
}
```

8. 設定透過HTTPS取得靜態檔案  
如此就能透過 [https://<對外host>:<對外port>/static/<...>]()  
從file system取得相對應路徑的檔案 
alias要寫絕對路徑  
　  
server {}的段落下新增：  
```
location /static/ {
    alias   <...>/facebock/static/;
}
```

在這裡的例子中 [https://<對外host>:<對外port>/static/img/logo.png]()  
會取得 [<...>/facebock/static/img/logo.png]() 的檔案

9. 設定Websocket連接時，從WSS跳轉到Daphne的WS  
如此就能透過 [wss://<對外host>:<對外port>/websocket/<...>]()  
轉接到Daphne的 [ws://<對內host>:<對內port>/websocket/<...>]()  
　  
server {}的段落下新增：  
```
location /websocket/ {
    proxy_pass http://<對內host>:<對內port>/websocket/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

10.  設定為之後，nginx.confconf中http {...}下的server {...}會是

```
server {
    listen       <對外port> ssl;
    server_name  <對外host>;

    ssl_certificate      <...>\facebok\server.crt;
    ssl_certificate_key  <...>\facebok\server.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        proxy_pass http://<對內port>:<對內port>/;
    }

    location /static/ {
        alias   <...>/facebock/static/;
    }

    location /websocket/ {
        proxy_pass http://<對內host>:<對內port>/websocket/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

11.  將[restart.bat](file/restart.bat)複製到Nginx的安裝目錄中  
以便於未來雙擊它來重新啟動或啟動Nginx

# 安裝Daphne

1. 到[Daphne官方網站](https://sourceforge.net/projects/daphne/)下載[安裝檔](https://sourceforge.net/projects/daphne/files/latest/download)

2. 安裝Daphne

!! daphne 似乎是跟個channel一起安裝的，請問這個daphne是....?

# 安裝所需的python package

1. 進入Facebock project 的主目錄

2. 執行指令 `pip3 install -r requirement.txt`  
  
[回上一頁](../文件導覽.md)  