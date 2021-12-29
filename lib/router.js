const userHandler = require('./usersHandler')
const tokenHandler = require('./tokenshandler')
const checksHandler = require('./checksHandler')

let handlers = {}

handlers.ping = (data, callback) => {

    callback(200)
} 


handlers.notFound = (data, callback) => {

    callback(404)
}


const router = {

    ping: handlers.ping,

    users: userHandler.users,

    tokens: tokenHandler.tokens,

    checks: checksHandler.checks
}


module.exports = {router, handlers}