const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
// Setup for Local Hosting, will switch to production on Heroku

const { Pool } = require('pg');

var pool = new Pool({
  connectionString: 'postgres://postgres:cmpt276@localhost/person'
});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .post('/addPersonData', (req, res) => {
    // adds one Person entry
    const {
      name,
      size,
      height,
      type
    } = req.body;

    var query = `
      INSERT INTO people
      VALUES ('${name}', ${size}, ${height}, '${(type)}');
      `;

    pool.query(query, function(error, result){
      // console.log("this is good", result);
      // console.log("this is error", error);
      pool.query('SELECT * FROM people;', (err, renderResults) => {

          var results = {
            'results': renderResults.rows ? renderResults.rows : [],
          };
          res.render('pages/index', results);

      });
    });

  })
  .get('/', (req, res) => {
    // returns an entire array of people data
    pool.query('SELECT * FROM people;', function(error, result){

        var results = {
          'results': result.rows ? result.rows : [],
          };
        // console.log(results);
        res.render('pages/index', results);


    });
  })
  .post('/sortPersonData', (req, res) => {
    const {
      PersonSort
    } = req.body;

    var fNameSort = PersonSort === 'name' ? ', name ASC' : '';

    var query = `
      SELECT *
      FROM people
      ORDER BY ${PersonSort} ASC ${fNameSort};
      `;

    pool.query(query, (err, renderResults) => {

        var results = {
          'results': renderResults.rows ? renderResults.rows : [],

        };
        res.render('pages/index', results);

    });

  })
  .post('/editPersonData', (req, res) => {
    // edits one Person entry
    const {
      name,
      size,
      height,
      type,
      willDelete
    } = req.body;

    var query = '';

    // Decide whether deleting or just editing
    if (willDelete == "true") {
      query = `
        DELETE FROM people
        WHERE name= '${name}';
        `;
    } else {
      console.log("Updating...")
      query = `
      UPDATE people
      SET name='${name}', height=${height}, size=${size}, type='${type}'
      WHERE name='${name}';
        `;
    }

    pool.query(query, function(error, result){

      pool.query('SELECT * FROM people;', (err, renderResults) => {

          var results = {
            'results': renderResults.rows ? renderResults.rows : [],
          };
          res.render('pages/index', results);

      });
    });

  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
