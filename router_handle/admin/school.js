//数据库
let db = require('../../db/db')

exports.addSchoolItem = function (req, res) {
  let schoolItem = req.body.school || {}
  let sql = 'select * from school where academy =? and major =? and class =? order by academy'
  db.query(sql, [schoolItem.academy, schoolItem.major, schoolItem.class], function (err, results) {
    if (err) {
      return res.ss(500, '数据库读取失败')
    }
    if (results.length !== 0) {
      return res.ss(400, '不能重复添加')
    }
    sql = 'insert into school set ? '
    db.query(sql, schoolItem, function (err, results) {
      if (err) {
        return res.ss(500, '数据库读取失败')
      }
      if (results.affectedRows !== 1) {
        return res.ss(400, '添加失败')
      }
      res.ss(200, '添加成功')
    })
  })
}
function arrConversion(arr) {
  let keyList = Object.keys(arr[0])
  keyList = keyList.filter(item => (item !== 'id' && item !== 'deleted'))
  let subList = []
  arr.forEach(item => {
    let name1List = subList.map(item => item.value)
    if (name1List.indexOf(item[keyList[0]]) !== -1) {
      let name2List = subList[name1List.indexOf(item[keyList[0]])].children.map(item => item.value)
      if (name2List.indexOf(item[keyList[1]]) !== -1) {
        let name3List = subList[name1List.indexOf(item[keyList[0]])].children[name2List.indexOf(item[keyList[1]])].children.map(item => item.value)
        if (name3List.indexOf(item[keyList[2]]) !== -1) {
        } else {
          subList[name1List.indexOf(item[keyList[0]])].children[name2List.indexOf(item[keyList[1]])].children.push({
            label: item[keyList[2]],
            value: item[keyList[2]]
          })
        }
      } else {
        subList[name1List.indexOf(item[keyList[0]])].children.push({
          label: item[keyList[1]],
          value: item[keyList[1]],
          children: [
            {
              label: item[keyList[2]],
              value: item[keyList[2]]
            }
          ]
        })
      }
    } else {
      subList.push({
        label: item[keyList[0]],
        value: item[keyList[0]],
        children: [
          {
            label: item[keyList[1]],
            value: item[keyList[1]],
            children: [
              {
                label: item[keyList[2]],
                value: item[keyList[2]]
              }
            ]
          }
        ]
      })
    }
  })
  return subList
}
exports.getSchoolList = function (req, res) {
  let sql = 'select * from school where deleted !=1'
  db.query(sql, function (err, results) {
    if (err) {
      return res.ss(500, '数据库读取失败')
    }
    let schoolList = arrConversion([...results])
    res.ss(200, '获取院系列表成功', { schoolList })
  })
}

exports.deleteSchoolItem = function (req, res) {
  let schoolItem = req.body.school
  let sql = 'update school set deleted = 1 where academy =? '
  schoolItem[1] ? sql += 'and major =?' : ''
  schoolItem[2] ? sql += 'and class = ?' : ''
  db.query(sql, schoolItem, function (err, results) {
    if (err) {
      return res.ss(500, '数据库操作失败')
    }
    if (results.affectedRows == 0) {
      return res.ss(400, '删除失败')
    }
    res.ss(200, '删除成功')
  })
}

exports.editSchoolItem = function (req, res) {
  let { oldValue, newValue } = req.body
  let sql = 'update school set ? where academy =? '
  oldValue[1] ? sql += 'and major =?' : ''
  oldValue[2] ? sql += 'and class = ?' : ''
  db.query(sql, [newValue, ...oldValue], function (err, results) {
    if (err) {
      return res.ss(500, '数据库操作失败')
    }
    if (results.affectedRows == 0) {
      return res.ss(400, '修改失败')
    }
    res.ss(200, '修改成功')
  })
}