const mysql = require('mysql2/promise');
const config = require('./config');
const helper = require('./helper');

async function query(sql, params) {
  const connection = await mysql.createConnection(config);
  const [results, ] = await connection.execute(sql, params);

  return results;
}

async function getUserData(username) {
    const rows = await query(
        'SELECT * FROM UserData WHERE username = ?;',
        [username]
    );
    const data = helper.emptyOrRows(rows)[0];

    return data;
}

async function createUser(name, username, password) {
  const result = await query(
    `INSERT INTO UserData (name, username, password)
    VALUES
    (?,?,?)`,
    [
      name, 
      username,
      password
    ]
  );

  let message = 'Error in creating user';
  if (result.affectedRows) {
    message = 'User created successfully';
  }

  return {message}; 
}

async function addBook(title, author, description) {
  const result = await query(
    `INSERT INTO Books (title, author, description)
    VALUES
    (?,?,?)`,
    [
      title, 
      author,
      description
    ]
  );

  let message = 'Error in creating user';
  if (result.affectedRows) {
    message = 'Book created successfully';
  }

  return message; 
}

async function getBooks() {
  console.log("in get books");
  const result = await query(
    `SELECT * FROM Books`,
    []
  );

  let message = 'Error in getting books';
  if (result.affectedRows) {
    message = 'Books received';
  }

  const list = [];
  Object.keys(result).forEach(function(key) {
    var row = result[key];
    list.push(row);
  });

  console.log(list);
  return list; 
}

async function getChat(idBooks) {
  console.log("in get books");
  const result = await query(
    `SELECT * FROM Posts WHERE idBooks=?`,
    [idBooks]
  );

  let message = 'Error in getting chat';
  if (result.affectedRows) {
    message = 'Chat received';
  }

  const list = [];
  Object.keys(result).forEach(function(key) {
    var row = result[key];
    list.push(row);
  });

  console.log(list);
  return list; 
}

async function addChat(content, authorName, idBooks) {
  console.log("in addChat");
  const result = await query(
    `INSERT INTO Posts (content, authorName, idBooks)
    VALUES
    (?,?,?)`,
    [
      content, 
      authorName,
      idBooks
    ]
  );

  let message = 'Error in creating chat';
  if (result.affectedRows) {
    message = 'Chat created successfully';
  }

  return message; 
}

module.exports = {
  getUserData,
  createUser, 
  addBook,
  getBooks,
  addChat,
  getChat
}