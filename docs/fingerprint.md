# Webauthn

### STEP 1  
在views.py中加入: (RP_ID , ORIGIN 依據架設環境改變)

    import facebock.webauthn as webauthn
    RP_ID = 'localhost'
    ORIGIN = 'http://localhost:8000'
    TRUST_ANCHOR_DIR = 'trusted_attestation_roots'
##
### STEP2
可選擇 (1)或者(2)  
(1)在html中設定button
     
    <form id="register-form" name="register" method="get">{% csrf_token %}
        <label for="register_username">Username:</label>
        <input name="register_username">
        <label for="register_display_name">Display Name:</label>
        <input name="register_display_name">
        <button id="register" type="submit">Register with WebAuthn</button>
    </form>
    
    <form id="login-form" name="login" method="get">{% csrf_token %}
        <label for="login_username">Username:</label>
        <input name="login_username">
        <button id="login" type="submit">Log in with WebAuthn</button>
    </form>
(2)webauthn.js  
更改下方程式碼，改變trigger *didClickReister* 和 *didClickLogin*方式  
    
    document.addEventListener("DOMContentLoaded", e => {
        document.querySelector('#register').addEventListener('click', didClickRegister);
        document.querySelector('#login').addEventListener('click', didClickLogin);
    });

更改下方程式碼，改變傳入資料
    
    const form = document.querySelector('#login-form');
    const formData = new FormData(form);
* Register需有 username, displayname  
* login 需有 username  

##
### DEMO  Usage

開啟server後 進入 <localhost:8000>
##### Register
輸入Username 和 Display Name後 按下 *Register with WebAuthn*  
驗證成功後會創建新的user
##### Login
輸入以webauthn創建的username 按下 *Log in with WebAuthn*
驗證成功後登入系統

##  
[channel 參考資料](https://channels.readthedocs.io/en/latest/)
