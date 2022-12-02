let mysql = require('mysql')
let db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'admin123',
  database: 'campus'
})
module.exports = db