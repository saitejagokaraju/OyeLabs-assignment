const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const bcrypt = require('bcrypt')

const databasePath = path.join(__dirname, 'userData.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    await database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        name TEXT,
        password TEXT,
        phone TEXT,
        gender TEXT,
        location TEXT
      );
    `)

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const validatePassword = password => {
  return password.length >= 5
}

app.post('/register', async (request, response) => {
  const {username, name, password, phone, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}' OR phone = '${phone}';`
  const databaseUser = await database.get(selectUserQuery)

  if (!databaseUser) {
    if (validatePassword(password)) {
      const createUserQuery = `
        INSERT INTO users (username, name, password, phone, gender, location)
        VALUES ('${username}', '${name}', '${hashedPassword}', '${phone}', '${gender}', '${location}');
      `
      await database.run(createUserQuery)
      response.send('User created successfully')
    } else {
      response.status(400).send('Password is too short')
    }
  } else {
    response.status(400).send('User already exists')
  }
})

app.post('/login', async (request, response) => {
  const {username, password, phone} = request.body
  let selectUserQuery

  if (username && password) {
    selectUserQuery = `SELECT * FROM users WHERE username = '${username}';`
  } else if (phone && password) {
    selectUserQuery = `SELECT * FROM users WHERE phone = '${phone}';`
  } else {
    response.status(400).send('Invalid credentials')
    return
  }

  const databaseUser = await database.get(selectUserQuery)

  if (!databaseUser) {
    response.status(400).send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      databaseUser.password,
    )
    if (isPasswordMatched) {
      response.send('Login success!')
    } else {
      response.status(400).send('Invalid password')
    }
  }
})

app.post('/add-customer', async (request, response) => {
  const {username, name, password, phone, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const connection = await database.driver().verbose().database
    await connection.run('BEGIN TRANSACTION')

    const selectUserQuery = `SELECT * FROM users WHERE username = '${username}' OR phone = '${phone}';`
    const databaseUser = await connection.get(selectUserQuery)

    if (!databaseUser) {
      if (validatePassword(password)) {
        const createUserQuery = `
          INSERT INTO users (username, name, password, phone, gender, location)
          VALUES ('${username}', '${name}', '${hashedPassword}', '${phone}', '${gender}', '${location}');
        `
        await connection.run(createUserQuery)
        await connection.run('COMMIT')
        response.send('Customer added successfully')
      } else {
        response.status(400).send('Password is too short')
      }
    } else {
      response.status(400).send('Customer already exists')
    }
  } catch (error) {
    response.status(500).send('Internal server error')
  }
})

module.exports = app
