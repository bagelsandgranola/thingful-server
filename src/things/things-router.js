//implement basic authentication middleware to use for protec. endpoings

// GET /api/things is public
//DONE

// GET /api/things/:thing_id protected by basic auth
//DONE

// GET /api/things/:thing_id/reviews protected 
//DONE

// POST /api/reviews protected by baic auth + auto assign a user-id

// thingful-client store base64 encoded credentials when login form submitted

// base64 encoded credentials should be sent in requests to proteced endpoints

// if user attempts to view login form when they are logged in,
//they should be redirected to the thing list page

// if a user trieds to view reviews for a thing, they should
// be redirected to the login form page


const express = require('express')
const ThingsService = require('./things-service')
const { requireAuth } = require('../../middleware/basic-auth')

const thingsRouter = express.Router()

thingsRouter
  .route('/')
  .get((req, res, next) => {
    ThingsService.getAllThings(req.app.get('db'))
      .then(things => {
        res.json(ThingsService.serializeThings(things))
      })
      .catch(next)
  })

thingsRouter
  .route('/:thing_id')
  .all(requireAuth)
  .all(checkThingExists)
  .get((req, res) => {
    res.json(ThingsService.serializeThing(res.thing))
  })

thingsRouter.route('/:thing_id/reviews/')
  .all(requireAuth)
  .all(checkThingExists)
  .get((req, res, next) => {
    ThingsService.getReviewsForThing(
      req.app.get('db'),
      req.params.thing_id
    )
      .then(reviews => {
        res.json(ThingsService.serializeThingReviews(reviews))
      })
      .catch(next)
  })

/* async/await syntax for promises */
async function checkThingExists(req, res, next) {
  try {
    const thing = await ThingsService.getById(
      req.app.get('db'),
      req.params.thing_id
    )

    if (!thing)
      return res.status(404).json({
        error: `Thing doesn't exist`
      })

    res.thing = thing
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = thingsRouter
