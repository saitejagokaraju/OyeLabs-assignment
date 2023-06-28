const mysql = require('mysql')

const customers = [
  {
    customerId: 1,
    name: 'santosh',
    email: 'santosh11@yopmail.com',
  },
  {
    customerId: 2,
    name: 'ravi',
    email: 'ravi11@yopmail.com',
  },
  {
    customerId: 3,
    name: 'anurag',
    email: 'anurag11@yopmail.com',
  },
  {
    customerId: 4,
    name: 'sameer',
    email: 'sameer11@yopmail.com',
  },
  {
    customerId: 5,
    name: 'akash',
    email: 'akash11@yopmail.com',
  },
  {
    customerId: 6,
    name: 'anjali',
    email: 'anjali11@yopmail.com',
  },
]

function insertCustomersIntoDB() {
  const connection = mysql.createConnection({
    host: 'localhost', // Replace with your MySQL host
    user: 'your_username', // Replace with your MySQL username
    password: 'your_password', // Replace with your MySQL password
    database: 'your_database', // Replace with your MySQL database name
  })

  connection.connect(err => {
    if (err) {
      console.error('Error connecting to MySQL:', err)
      return
    }
    console.log('Connected to MySQL database')

    const sql =
      'INSERT INTO customers (customerId, name, email) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = ?'

    customers.forEach(customer => {
      const {customerId, name, email} = customer
      connection.query(sql, [customerId, name, email, name], (err, result) => {
        if (err) {
          console.error('Error inserting/updating customer:', err)
        } else {
          console.log('Customer inserted/updated:', customerId, email)
        }
      })
    })

    connection.end(err => {
      if (err) {
        console.error('Error closing MySQL connection:', err)
      } else {
        console.log('MySQL connection closed')
      }
    })
  })
}

insertCustomersIntoDB()
