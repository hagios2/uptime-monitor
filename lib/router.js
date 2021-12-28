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

    console.log(firstName, 'firstname')

    console.log(lastName, 'lastname')

    console.log(phoneNumber, 'phoneNumber')

    console.log(password, 'password')

    console.log(tosAgreement, 'tosAgree')

    if (firstName && lastName && phoneNumber && password && tosAgreement ) {

        _data.read('users', phoneNumber, function(err, data) {
         
            if (err) {

                const hashPassword = helpers.hash(password)

                if (hashPassword) {
                    
                    let userObject = {
                        firstName,
                        lastName,
                        phoneNumber,
                        hashPassword,
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