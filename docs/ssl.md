# Localhost的SSL
## 安裝mkcert
使用 <a href="https://chocolatey.org/">Chocolatey</a> 安裝
```shell script
choco install mkcert
```
必須使用系統管理員權限

## 使用mkcert安裝憑證
開啟一個系統管理員權限的cmd或是powershell，輸入下列指令
```shell script
mkcert -install
```
此指令會安裝mkcert自身的根憑證  
接著會跳出確認視窗，確認是否安裝憑證，點擊是
  
接著產生 *localhost* 的憑證  
```shell script
mkcert localhost
```
此指令會在當前資料夾下，產生 *localhost-key.pem* 與 *localhost.pem*  
這兩個檔案分別為密鑰與公鑰，將他放到Django方案資料夾下

接著到方案資料夾，執行
```shell script
daphne -e ssl:8443:privateKey=localhost-key.pem:certKey=localhost.pem facebock.asgi:application
```
8443是port，可以自訂  
接著就可以在 *https://localhost:8443/* 進行測試  

## linux環境
由於在linux應該是已經有ssl的檔案，通常不會用到這個工具  
不過要用的話，除了安裝過程外，其餘都與windows相同  
可以參考git上的說明：<https://github.com/FiloSottile/mkcert>
