var createError = require('http-errors');//1
var express = require('express');//-------------
var path = require('path');
var logger = require('morgan');//++++++++++++
/* 这是原始的项目的修改 */
/* 这是原始项目的第二次修改 */
/* 这是原始项目的第三次修改--- */
var adminRouter = require('./routes/admin');
var mobileRouter = require('./routes/mobile');

var app = express();//2

//处理跨域
let cors = require('cors')//-------------
app.use(cors())

//静态资源暴露
app.use(express.static(path.join(__dirname, 'public')));

let config = require('./config')
//解析token中间件,如果token失效则发出一个错误，在全局中间件中捕捉这个错误
let { expressjwt } = require('express-jwt')
app.use(expressjwt({
  secret: config.jwtSecret,
  algorithms: ["HS256"],
  credentialsRequired: true//  false：不校验
}).unless({
  path: [/^\/admin\/user\/(login|register)/]
}))

//解析请求体数据
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//全局中间件
/* 加一行 */
app.use(function (req, res, next) {
  console.log('中的');
  res.ss = function (code, message, data) {
    let content = { code, message }
    data ? content.data = data : ''
    res.send(content)
  }
  next()
})

app.use('/admin', adminRouter);
app.use('/mobile', mobileRouter);

// 路由失败，404处理
app.use(function (req, res, next) {
  next(createError(404));
});

// 错误处理
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.send({ code: 400, message: '未登录或token失效' })
  }

  console.log('错误处理');
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
/* 这是clone下的对文件的修改 */
/* 这是clone下的对文件的修改2 *///1
/* 这是clone下的对文件的修改 *///1
/* 这是clone下的对文件的修改2 */
/* 这是clone的三次修改 */
/* 这是clone的四次修改 */
/* clone加一行 */
/2
//1
