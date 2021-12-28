let handlers = {}

handlers.ping = function (data, callback) {

    callback(200)
} 

handlers.notFound = function(data, callback) {

    callback(404)
}


const router = {

    ping: handlers.ping
}


module.exports = {router, handlers}