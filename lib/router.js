const _data = require('./data')
const helpers = require('./helpers')

let handlers = {}

handlers.ping = function (data, callback) {

    callback(200)
} 


handlers.users = function (data, callback) {

    const acceptableMethods = ['post', 'get', 'put', 'delete']

    if (acceptableMethods.indexOf(data.method) > -1) {

        handlers._users[data.method](data, callback)
    } else{
        callback(405)
    }
} 


handlers._users = {}

handlers._users.post = function (data, callback) {

    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false

    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false

    const phoneNumber = typeof(data.payload.phoneNumber) == 'string' && data.payload.phoneNumber.trim().length == 10 ? data.payload.phoneNumber.trim() : false

    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false

    if (firstName && lastName && phoneNumber && password && tosAgreement ) {

        _data.read('users', phoneNumber, function(err, data) {
         
            if (err) {

                const hashedPassword = helpers.hash(password)

                if (hashedPassword) {
                    
                    let userObject = {
                        firstName,
                        lastName,
                        phoneNumber,
                        hashedPassword,
                        tosAgreement
                    }
    
                    _data.create('users', phoneNumber, userObject, function (err) {
    
                        if (!err) {
    
                            callback(201)
                        
                        } else {
    
                            console.log(err)
    
                            callback(500, {'Error': 'Could not create the new user'})
                        }
                    })

                } else {

                    callback(500, {'Error': 'Could not hash the user\'s password'})
                }

            } else {

                callback(400, {'Error': 'A user with that phone number already exists'})
            }
        })

    } else {
        callback(400, {'Error': 'Missing required fields'})
    }

}


handlers._users.get = function (data, callback) {
    
    const phoneNumber = typeof(data.queryStringObject.phoneNumber) == 'string' && data.queryStringObject.phoneNumber.trim().length == 10 ? data.queryStringObject.phoneNumber.trim() : false

    if (phoneNumber) {
        
        _data.read('users', phoneNumber, function (err, data) {

            if (!err && data) {

                delete data.hashedPassword

                callback(200, data)

            } else {

                callback(404)
            }

        })

    } else {

        callback(400, {Error: "Missing required field"})

    }
}


handlers._users.update = function (data, callback) {
    
}


handlers._users.delete = function (data, callback) {
    
}

handlers.notFound = function(data, callback) {

    callback(404)
}


const router = {

    ping: handlers.ping,

    users: handlers.users
}


module.exports = {router, handlers}