//You should create a POST /login endpoint 
    //that responds with a JWT. DONE
//You should update your login form to call the login endpoint 
    //and store the JWT from the response in local storage. 
    //Ensure that all the API requests use this token instead of the basic token.
//You'll need to change your middleware for protected 
    //endpoints to verify the JWT instead of verifying 
    //the base64 encoded basic auth header.

const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken')

describe('Auth Endpoints', function(){
    let db

    const {testUsers} = helpers.makeThingsFixtures()
    const testUser = testUsers[0]

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`POST /api/auth/login`, () => {
        beforeEach('insert users', () =>
            helpers.seedUsers(
                db, 
                testUsers,
            ) 
        )

        const requiredFields = ['user_name', 'password']

        requiredFields.forEach(field => {
            const loginAttemptBody = {
                user_name: testUser.user_name,
                password: testUser.password,
            }
        
        it(`responds with 400 required error when '${field}' is missing`, () => {
            delete loginAttemptBody[field]

            return supertest(app)
                .post('/api/auth/login')
                .send(loginAttemptBody)
                .expect(400, {
                    error: `Missing '${field}' in request body`,
                })
            })

        it(`responds 400 'invalid user_name or password' when bad user_name`, () => {
            const invalidUserName = { user_name: 'no exist', password: 'password'}

            return supertest(app)
                .post('/api/auth/login')
                .send(invalidUserName)
                .expect(400, {
                    error: `invalid user_name or password`
                })    
            })

        it(`responds 400 'invalid user_name or password' when bad password`, () => {
            const invalidPassword = { user_name: testUser.user_name, password: 'wrong'}

            return supertest(app)
                .post('/api/auth/login')
                .send(invalidPassword)
                .expect(400, {
                    error: `invalid user_name or password`})    
            })
        it(`responds 200 and JWT auth token using secret when valid creds`, () => {
            const userValidCreds = {
                user_name: testUser.user_name,
                password: testUser.password
            }

            const expectedToken = jwt.sign(
                {user_id: testUser.id}, //payload
                process.env.JWT_SECRET,
                { 
                    subject: testUser.user_name,
                    algorithm: 'HS256'
                }
            )
            return supertest(app)
                .post('/api/auth/login')
                .send(userValidCreds)
                .expect(200, {
                    authToken: expectedToken
                })
            })


        })
        
    })
})