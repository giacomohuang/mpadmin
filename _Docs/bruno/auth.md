```mermaid
sequenceDiagram
    participant page as 页面
    participant fetch as API拦截器
    participant clientrouter as 客户端路由
    participant serverrouter as 服务端拦截器

    participant server as 服务端

    page->>clientrouter:发起请求
    page->>fetch:API请求
    fetch->>serverrouter:拦截请求

```
