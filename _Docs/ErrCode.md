| 模块                                     | status | message                         | code | 备注                                     |
| :--------------------------------------- | ------ | ------------------------------- | ---- | ---------------------------------------- |
| controllers/account.js/signin            | 401    | Invalid accountname or password | 1001 | 用户名密码错误                           |
| middlewares/authtoken/authToken          | 401    | Authentication Failed           | 901  | request headers 中没有 authorization字段 |
| middlewares/authtoken/authToken          | 401    | Authentication Failed           | 902  | accessToken验证失败                      |
| middlewares/authtoken/refresh            | 401    | Authentication Failed           | 903  | refreshToken的redis缓存不存在            |
| middlewares/authtoken/refresh            | 401    | Authentication Failed           | 904  | refreshToken验证失败                     |
| controllers/verification/sendCodeByEmail | 401    | Authenication Denied            | 101  | request headers 中没有 accountid字段     |
| controllers/verification/sendCodeByEmail | 400    | Too Frequently                  | 102  | 邮件发送太频繁                           |
| controllers/verification/sendCodeBySMS   | 401    | Authenication Denied            | 103  | request headers 中没有 accountid字段     |
| controllers/verification/sendCodeBySMS   | 400    | Too Frequently                  | 104  | 短信发送太频繁                           |