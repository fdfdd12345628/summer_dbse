http test(use uwsgi)
多個uwsgi會比單個uwsgi多程序好
500 user下
4uwsgi: 225 rps, 900 user start fail
2uwsgi: 215 rps. 700 user start fail
1uwsgi: 220 rps, 700 user start fail

用nginx的load balance來分散到各個uwsgi感覺比較好
但也沒有顯著的差異

mysql比sqlite好(防止資料庫鎖定問題)
但是還是會有race condition
可能需要寫django時注意

websocket test(use daphne)
websocket request:
9400 websocket rps

websocket connections:
3.54g -> 6.45g     
only consume ram, won't consume cpu

websocket create connection performance:
1000 websocket created per second
maybe can't be faster because of overhead?

each django instance: ~55 MB ram, 0.7% cpu
125 django instance reach 80% ram on total 9.3 GB ram

900 connections to websocket
limited due to too many files open
may be change by ulimit -n


1 django, 1 mysql: 97 requests per second
1 django, 4 mysql: 95 requests per second
4 django, 1 mysql: 232 requests per second
4 django, 4 mysql: 235 requests per second
