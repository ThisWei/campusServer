var express = require('express');
var router = express.Router();

let userHandle = require('../router_handle/admin/user')
//登录
router.post('/user/login', userHandle.login);
//获取个人信息
router.get('/user/info', userHandle.getInfo);
//注册
router.post('/user/register', userHandle.register);


let adminHandle = require('../router_handle/admin/admin')
//获取管理员列表
router.get('/admin/getadmin', adminHandle.getAdmin);
//删除管理员
router.post('/admin/deleteadmin', adminHandle.deleteAdmin);
//修改管理员
router.post('/admin/editadmin', adminHandle.editAdmin);
//修改管理员状态
router.post('/admin/alterstatus', adminHandle.alterStatus);

let shoolHandle = require('../router_handle/admin/school')
//添加院系条目
router.post('/school/add', shoolHandle.addSchoolItem)
//获取院系列表
router.get('/school/get', shoolHandle.getSchoolList)
//删除院系条目
router.post('/school/delete', shoolHandle.deleteSchoolItem)
//修改院系条目
router.post('/school/edit', shoolHandle.editSchoolItem)




module.exports = router;
