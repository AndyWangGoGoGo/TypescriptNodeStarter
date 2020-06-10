import { Response } from "express"

export class ControllerBase{
    responseSuccess = (statusCode: HttpStatusCode, data: object, msg: string, res: Response): void =>{
        res.status(statusCode).json({
            code: 0,
            data,
            msg
        });
    }

    responseFail = (statusCode: HttpStatusCode, data: object, msg: string, res: Response): void =>{
        res.status(statusCode).json({
            code: -1,
            data,
            msg
        });
    }

    responseWarn = (statusCode: HttpStatusCode, data: object, msg: string, res: Response): void =>{
        res.status(statusCode).json({
            code: 1,
            data,
            msg
        });
    }
}

enum ErrCode{
    SUCCESS,
    INVALID_CODE,
    INVALID_UPLOAD,
    INVALID_INFO,
    INVALID_USER,
    INVALID_CLIENT,
    INVALID_AUTHORIZE
}

enum HttpStatusCode{
    OK = 200,//OK，请求处理成功
    Created = 201,//Created，请求处理成功，并且新资源已经创建
    Accepted = 202,//Accepted，请求已经接受，正在处理，尚未处理完成
    NoContent = 204,//No Content，响应内容为空，在 asp.net core 中返回一个 Json(null) 的时候就会是一个 NoContent 的结果
    MovedPermanently = 301,//Moved Permanently 永久重定向
    Found = 302,//Found 临时重定向
    TemporaryRedirect = 307,//Temporary Redirect 临时重定向请求
    //Permanent Redirect 永久重定向请求
    //这几个重定向的区别：301、302 只支持 GET 请求，如果是 POST 请求，重定向后会使用 GET 请求且 Body 数据会丢失
    //307、308 支持 POST 请求，在 POST 重定向的时候会带上原来请求的 body 再请求新的地址，body 数据不会丢失
    //302、307 是临时重定向， 301、308 是永久重定向，是允许缓存的，浏览器可以缓存
    PermanentRedirect = 308,
    NotModified = 304,//Not Modified，资源未发生修改，可以直接使用浏览器本地缓存
    BadRequest = 400,//BadRequest，错误请求，一般用来表示请求参数异常，比如请求的某一个参数不能为空，但实际请求是空
    Unauthorized = 401,//Unauthorized，未授权，资源需要授权或登录，而用户没有登录或者没有提供访问所需的 Token 等
    Forbidden = 403,//Forbidden，禁止访问，当前用户没有权限访问资源，如需要Admin角色的用户，但是请求的用户没有这个角色
    NotFound = 404,//NotFound，未找到资源，资源不存在
    MethodNotAllowed = 405,//Method Not Allowed，不允许的方法调用，资源不支持的请求方法，比如资源只允许 GET 请求，但是实际请求使用了 POST 或 DELETE 方法
    NotAcceptable = 406,//Not Acceptable，请求的资源客户端不支持处理，比如客户端希望获取 xml 的响应，但是服务器端只支持 JSON 响应
    RequestTimeout = 408,//Request Timeout, 请求处理超时
    Conflict = 409,//Conflict，请求资源冲突，常发生在 PUT 更新资源信息时发生，比如更新时指定资源的 ETAG，但是PUT请求时，资源的 ETAG 已经发生变化
    Gone = 410,//Gone，请求资源在源服务器上不再可用
    LengthRequired = 411,//Length Required，请求需要携带 Content-Length 请求头
    PreconditionFailed = 412,//Precondition Failed，请求预检失败，请求的某些参数不符合条件
    PayloadTooLarge = 413,//Payload Too Large，请求的参数太大，请求的 body 过大，服务器拒绝处理
    URITooLong = 414,//URI Too Long，请求的 URI 地址太长，服务器拒绝处理
    UnsupportedMediaType = 415,//Unsupported Media Type，不支持的媒体类型或不支持的编码，比如服务器只支持处理 JSON 请求，但是请求是 xml 格式
    InternalServerError = 500,//Internal Server Error，服务器内部错误
    NotImplemented = 501,//Not Implemented 服务器不支持需要处理请求的功能，比如图片压缩等处理
    BadGateway = 502,//Bad Gateway 反向代理或网关找不到处理请求的服务器
    ServiceUnavailable = 503,//Service Unavailable 服务不可用
    GatewayTimeout = 504,//Gateway Timeout 网关超时
    HTTPVersionNotSupported = 505//HTTP Version Not Supported，不支持的 HTTP 版本，服务器不支持或拒绝处理这个 HTTP 版本的请求
}