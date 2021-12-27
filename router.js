let handlers = {}

handlers.sample = function (data, callback) {

    callback(200, {name: 'sample handler'})
} 

handlers.notFound = function(data, callback) {

    callback(404)
}


const router = {

    sample: handlers.sample
}


module.exports = {router, handlers}