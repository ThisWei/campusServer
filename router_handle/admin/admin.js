//数据库
let db = require('../../db/db')

//处理时间
const moment = require('moment')

//处理form-data数据
let formidable = require('formidable')

//路径处理
let path = require('path')

//密码加密模块
let bcrypt = require('bcrypt')

//文件处理
let fs = require('fs')


exports.getAdmin = function (req, res) {
  console.log('获取管理员列表模块');
  let auth = req.auth
  let sql = 'select * from admin where username !=? and deleted !=1'
  db.query(sql, auth.username, (err, results) => {
    if (err) {
      return res.ss(400, err)
    }
    let adminList = [
      ...results
    ]
    adminList = adminList.map(item => {
      let adminItem = {
        ...item,
        date: moment(item.date).format('YYYY-MM-DD HH:mm:ss')
      }
      delete adminItem.password
      return adminItem
    })

    res.ss(200, '获取管理员列表成功', { adminList })
  })
}

exports.deleteAdmin = function (req, res) {
  console.log('删除模块');
  let adminInfo = req.body.adminInfo
  if (!adminInfo.id) {
    return res.ss(400, '删除失败，请稍后再试')
  }
  let sql = 'select * from admin where id =? and deleted !=1'
  db.query(sql, adminInfo.id, function (err, results) {
    if (err) {
      return res.ss(500, '数据库读取失败')
    }
    if (results.length === 0) {
      return res.ss(400, '该账号不存在或已被删除')
    }
    sql = "update admin set deleted=1 where id=?";
    db.query(sql, adminInfo.id, function (err, results) {
      if (err) {
        return res.ss(500, '删除失败，请稍后再试！')
      }
      if (results.affectedRows !== 1) {
        return res.ss(500, '删除失败，请稍后再试！')
      }
      res.ss(200, 'ok')
    })
  })
}
function deleteFile(fileName) {
  if (!fileName) {
    return
  }
  let url = path.join(__dirname, '../../public/uploads', fileName)
  const isExistImg = fs.existsSync(url)
  if (isExistImg) {
    //删除文件
    fs.unlinkSync(url)
  }
}

exports.editAdmin = function (req, res) {
  console.log('修改模块');
  let form = formidable({
    //保存后缀
    keepExtensions: true,
    // 配置上传文件的位置
    uploadDir: path.join(__dirname, '../../public/uploads')
  })
  // 解析表单
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.ss(200, '数据解析错误')
    }
    let sql = 'select * from admin where id=?'
    db.query(sql, fields.id, function (err, results) {
      if (err) {
        files.avatar ? deleteFile(files.avatar.newFilename) : ''
        return res.ss(500, '数据库读取错误，请稍后再试')
      }
      if (results.length === 0) {
        files.avatar ? deleteFile(files.avatar.newFilename) : ''
        return res.ss(400, '修改失败，该账号不存在')
      }
      let adminInfo = {
        ...fields,
        password: bcrypt.hashSync(fields.password, 10),
      }
      if (files.avatar) {
        adminInfo.avatar = '/uploads/' + files.avatar.newFilename
      }
      let adminId = adminInfo.id
      delete adminInfo.id
      sql = 'update admin set ? where id = ?'
      db.query(sql, [adminInfo, adminId], function (err, results) {
        if (err) {
          files.avatar ? deleteFile(files.avatar.newFilename) : ''
          return res.ss(400, '数据库写入失败')
        }
        if (results.affectedRows !== 1) {
          files.avatar ? deleteFile(files.avatar.newFilename) : ''
          return res.ss(400, '修改失败')
        }
        res.ss(200, '修改成功')
      })
    })
  })
}

exports.alterStatus = function (req, res) {
  console.log('状态修改模块');
  let adminInfo = req.body.adminInfo
  let sql = 'select * from admin where id =? and deleted !=1'
  db.query(sql, adminInfo.id, function (err, results) {
    if (err) {
      return res.ss(500, '数据库读取失败')
    }
    if (results.length === 0) {
      return res.ss(400, '该账号不存在或已被删除')
    }
    sql = "update admin set status=? where id=?";
    db.query(sql, [adminInfo.status, adminInfo.id], function (err, results) {
      if (err) {
        return res.ss(500, '状态修改失败，请稍后再试！')
      }
      if (results.affectedRows !== 1) {
        return res.ss(500, '状态修改失败，请稍后再试！')
      }
      res.ss(200, '状态修改成功')
    })
  })
}