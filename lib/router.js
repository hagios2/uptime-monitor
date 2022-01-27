const userHandler = require('./usersHandler')
const tokenHandler = require('./tokenshandler')
const checksHandler = require('./checksHandler')
const smsHandler = require('./smsHandler')
const pagesHandler = require('./pagesHandler')
const authHandler = require('./authHandler')

let handlers = {}

handlers.ping = (data, callback) => {

    callback(200)
} 


handlers.notFound = (data, callback) => {

    callback(404)
}


const router = {
    '': pagesHandler.index,

    'account/create': userHandler.createAccount,

    'account/edit': userHandler.editAccount,

    'account/deleted': userHandler.deleteAccount,

    'session/create': authHandler.createSession,

    'session/delete': authHandler.deleteSession,

    'checks/all': checksHandler.checkList,

    'checks/create': checksHandler.checkCreate,

    'checks/edit': checksHandler.checkEdit,

    ping: handlers.ping,

    'api/users': userHandler.users,

    'api/tokens': tokenHandler.tokens,

    'api/checks': checksHandler.checks,

    smssend: smsHandler.sendTwilloSms,

    sendsms: smsHandler.smsApi
}


module.exports = {router, handlers}