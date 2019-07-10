http test(use uwsgi)
多個uwsgi會比單個uwsgi多程序好
500 user下
4uwsgi: 225 rps, 900 user start fail
2uwsgi: 215 rps. 700 user start fail
1uwsgi: 220 rps, 700 user start fail

用nginx的load balance來分散到各個uwsgi感覺比較好
但是卻沒有顯著的差異

mysql比sqlite好(防止資料庫鎖定問題)
但是還是會有race condition

websocket test(use daphne)
websocket request:
9400 websocket rps

websocket connections:
160000 connections up
3.54g -> 6.45g

websocket create connection performance:
1000 websocket create per second
