const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');


// const query = (text, params) => pool.query(text, params);

// query('SELECT * FROM users').then((res) => console.log(res.rows));



const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`${process.env.NODE_ENV}: App running on port ${port}...`);
});
