// app/api/db.js
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Asdf@333###',
  database: 'kalindikart',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// export const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'kalindikart',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });
