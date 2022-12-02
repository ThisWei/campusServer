//数据库
let db = require('../../db/db')

//密码加密模块
let bcrypt = require('bcrypt')

//时间处理模块
let moment = require('moment')

//token生成模块
let jwt = require('jsonwebtoken')

//配置模块
let config = require('../../config')

//处理form-data数据
let formidable = require('formidable')

//路径处理
let path = require('path')

//文件处理
let fs = require('fs')


//登录
exports.login = function (req, res) {
  let userInfo = req.body
  let sql = 'select * from admin where username=?'
  db.query(sql, userInfo.username, (err, results) => {
    if (err) {
      return res.ss(400, err)
    }
    if (results.length === 0) {
      return res.ss(400, '该账户不存在')
    }
    let compareResult = bcrypt.compareSync(userInfo.password, results[0].password)
    if (!compareResult) {
      return res.ss(400, '账号或密码不正确')
    }
    if (results[0].status !== 1) {
      return res.ss(400, '账号已停用，请联系管理员')
    }
    let tokenInfo = {
      ...results[0]
    }
    delete tokenInfo.password
    let tokenStr = jwt.sign(tokenInfo, config.jwtSecret, { expiresIn: config.tokenLimit })
    res.ss(200, '登录成功', {
      token: 'Bearer ' + tokenStr
    })
  })
}

//获得个人信息
exports.getInfo = function (req, res) {
  let userInfo = {
    ...req.auth
  }
  userInfo.roles = userInfo.roles.split('&')
  console.log(userInfo);
  res.ss(200, '获取用户信息成功', userInfo)
}

function deleteFile(fileName) {
  let url = path.join(__dirname, '../../public/uploads', fileName)
  const isExistImg = fs.existsSync(url)
  if (isExistImg) {
    //删除文件
    fs.unlinkSync(url)
  }
}

//注册
exports.register = function (req, res) {
  console.log('注册模块');
  let form = formidable({
    //保存后缀
    keepExtensions: true,
    // 配置上传文件的位置
    uploadDir: path.join(__dirname, '../../public/uploads')
  })
  // 解析表单
  form.parse(req, (err, fields, files) => {
    // err 错误对象
    // fields 普通表单数据
    // files 文件上传数据
    //console.log(fields)
    //console.log(files)
    let sql = 'select * from admin where username=?'
    db.query(sql, fields.username, function (err, results) {
      if (err) {
        deleteFile(files.avatar.newFilename)
        return res.ss(500, '数据库读取错误，请稍后再试')
      }
      if (results.length !== 0) {
        deleteFile(files.avatar.newFilename)
        return res.ss(400, '管理员账号不允许重复')
      }
      sql = 'insert into admin set ?'
      let userInfo = {
        ...fields,
        password: bcrypt.hashSync(fields.password, 10),
        avatar: '/uploads/' + files.avatar.newFilename,
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        status: 1
      }

      db.query(sql, userInfo, function (err, results) {
        if (err) {
          deleteFile(files.avatar.newFilename)
          console.log(userInfo);
          console.log(err);
          return res.ss(400, '数据库写入失败')
        }
        if (results.affectedRows !== 1) {
          deleteFile(files.avatar.newFilename)
          return res.ss(400, '注册失败')
        }
        res.ss(200, '注册成功')
      })
    })
  })
}