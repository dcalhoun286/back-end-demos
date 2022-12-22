const express = require('express');
const app = express();
const { Dog } = require('./db');
const { sequelize } = require('./db/db');
const { Op } = require('sequelize');

// RESTful is our architectrual style for organizing routes, and connecting routes to methods

/**good examples:
 * [VERB /noun -> description]
 * GET /users -> shows all users
 * GET /users/4 show single user (id=4 in db)
 * POST /users -> create new user in db
 * PUT /users/4 -> update the user with id=4 in db
 * DELETE /users/4 -> delete user 4 from db
 *    note: always user plural for consistency
 */

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.post('/dogs', async (req, res, next) => {
  try {
    const {name, breed, color, description} = req.body;
    const dog = await Dog.create({name, breed, color, description});
    res.send(dog);
  } catch (error) {
    next(error);
  }
});

app.delete('/dogs/:id', async (req, res, next) => {
  try {
    const {id} = req.params;
    const existingDog = await Dog.findByPk(id);
    if(!existingDog) {
      res.status(404).send(`Dog with id ${id} not found`);
      return;
    }
    await Dog.destroy({where: {id}});
    res.send(`deleted dog with id ${id}`);
  } catch (error) {
    next(error);
  }
});

app.get('/dogs', async (req, res, next) => {
  try {
    //TO DO
    // create our where object to build in the search queries
    const where = {};
    // loop through all of the possible queries (in array form)
    const queriesArray = ['name', 'description', 'breed', 'color'];

    for (const key of queriesArray) {
      // check if a specific query string param is inside the req.body
      if (req.query[key]) {
        // if it does exist, then add to the where obj and create options
        where[key] = {
          // using symbol operators to search for any string containing what is inside that specific parameter
          [Op.like]: `%${req.query[key]}%`
        }
      }
    }

    // const { name, breed, color, description } = req.query;
    // const dogs = await Dog.findAll();

    const dogs = await Dog.findAll({
      where
    });

    res.send(dogs);
  } catch (error) {
    next(error)
  }
});

const { PORT = 4000 } = process.env;

app.listen(PORT, () => {
  sequelize.sync({ force: false });
  console.log(`Dogs are ready at http://localhost:${PORT}`);
});
