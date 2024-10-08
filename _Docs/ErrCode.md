

| 模块                                     | status | message                         | code | 备注                                     |
| :--------------------------------------- | ------ | ------------------------------- | ---- | ---------------------------------------- |
| controllers/account/signin               | 400    | Invalid accountname or password | 1001 | 用户名密码错误                           |
| controllers/account/signin2FA            | 400    | Code Error                      | 1002 | 动态口令错误，两步验证失败               |
| middlewares/authtoken/authToken          | 401    | Authentication Failed           | 901  | request headers 中没有 authorization字段 |
| middlewares/authtoken/authToken          | 401    | Authentication Failed           | 902  | accessToken验证失败                      |
| middlewares/authtoken/authToken          | 409    | Conflict                        | --   | accessToken过期                          |
| controllers/account/refreshToken         | 401    | Authentication Failed           | 903  | refreshToken的redis缓存不存在            |
| controllers/account/refreshToken         | 401    | Authentication Failed           | 904  | refreshToken验证失败                     |
| controllers/account/refreshToken         | 401    | Authentication Failed           | 905  | refreshToken不存在                       |
| middlewares/authsign                     | 401    | Authentication Failed           | 910  | API参数签名验证失败                      |
| middlewares/authsign                     | 401    | Authentication Failed           | 911  | headers中没有包含timestamp或nonce        |
| controllers/verification/sendCodeByEmail | 401    | Authentication Failed           | 101  | request headers 中没有 accountid字段     |
| controllers/verification/sendCodeByEmail | 400    | Too Frequently                  | 102  | 邮件发送太频繁                           |
| controllers/verification/sendCodeBySMS   | 401    | Authentication Failed           | 103  | request headers 中没有 accountid字段     |
| controllers/verification/sendCodeBySMS   | 400    | Too Frequently                  | 104  | 短信发送太频繁                           |

400：普通业务错误

401：存在安全风险的调用
