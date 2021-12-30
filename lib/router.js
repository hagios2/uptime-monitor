const userHandler = require('./usersHandler')
const tokenHandler = require('./tokenshandler')
const checksHandler = require('./checksHandler')
const smsHandler = require('./smsHandler')

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

    checks: checksHandler.checks,

    smssend: smsHandler.sendTwilloSms,

    sendsms: smsHandler.smsApi
}


module.exports = {router, handlers}