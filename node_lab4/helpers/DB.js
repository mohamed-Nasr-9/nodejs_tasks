const mysql = require("mysql2/promise");

const query = async (query, params = []) => {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "node_lab"
    });

    const [results, fields] = await connection.execute(query, params);

    console.log(results);
    console.log(fields);
    return results;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  query,
};
