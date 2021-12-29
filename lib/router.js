const userHandler = require('./usersHandler')
const tokenHandler = require('./tokenshandler')

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

    tokens: tokenHandler.tokens
}


module.exports = {router, handlers}