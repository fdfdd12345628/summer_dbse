# Performance

## http requests test(useing uwsgi)
多個uwsgi會比單個uwsgi多程序好  
500 user下：  
* 4 uwsgi instance, each 1 thread: 225 rps
* 2 uwsgi instance, each 2 threads: 215 rps
* 1 uwsgi instance, each 4 threads: 220 rps

用nginx的load balance來分散到各個uwsgi感覺比較好  
但也沒有顯著的差異  

## 資料庫選擇
mysql比sqlite好(防止資料庫鎖定問題)  
但是還是會有race condition  
可能需要寫django時注意  

## websocket test(using uvicorn)
####每秒能處理的訊息
在不同執行序下，每種配置所能處理的websocket訊息上限
* 1 django, 1 mysql: 97 requests per second
* 1 django, 1 mysql: 208 requests per second
* 1 django, 4 mysql: 95 requests per second
* 4 django, 1 mysql: 232 requests per second
* 4 django, 4 mysql: 235 requests per second

在我們測試的情境下，mysql的cpu使用率都沒有超過70%過  
幾乎都是python把系統資源吃完

#### 每秒能建立的websocket
測試單純連結websocket，無其他requests的情況  
每秒可以創建最多1000個websockets，此時的cpu使用率不到50%  
可能因為某些overhead的關係，若要增加速度可能需要修改系統設定或是nginx設定  
環境：4 processes of uvicorn + nginx

#### 能夠創建的websocket上限
最多可以創建約900個websocket同時連線  
之後nginx會出現too many files open的錯誤訊息  
可以藉由 `ulimit -n` 來設定（預設值是1024，網路上推薦設定到65535）  
環境：4 processes of uvicorn + nginx

## 最多同時開啟的django上限
無負擔下，每個uwsgi大概用了55MB的記憶體與~0.7% cpu  
在9.3GB電腦下，開啟125個uwsgi便使ram使用率到達80%  
環境：n processes of uwsgi + nginx

※以上django的多程序測試，都是使用supervisor來管理
