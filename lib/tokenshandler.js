const _data = require('./data')
const helpers = require('./helpers')

let tokenHandler = {}

tokenHandler.tokens = function (data, callback) {

    const acceptableMethods = ['post', 'get', 'put', 'delete']

    if (acceptableMethods.indexOf(data.method) > -1) {

        tokenHandler[data.method](data, callback)
    } else{
        callback(405)
    }
} 

tokenHandler.get = () => {

}


tokenHandler.post = (data, callback) => {

    const phoneNumber = typeof(data.payload.phoneNumber) == 'string' && data.payload.phoneNumber.trim().length == 10 ? data.payload.phoneNumber.trim() : false

    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

    if (phoneNumber && password) {

        _data.read('users', phoneNumber, (err, userData) => {

            if(!err && userData) {

                const hashedPassword = helpers.hash(password)

                if (hashedPassword === userData.hashedPassword) {

                    const tokenId = helpers.createRandomString(80)

                    const expires = Date.now() + 1000 * 60 * 60

                    const tokenObject = {
                        phoneNumber,
                        tokenId,
                        expires
                    }

                    _data.create('tokens', tokenId, tokenObject, (err) => {

                        if(!err) {

                            callback(200, tokenObject)

                        } else {

                            callback(500, {error: 'Could not create the new token'})
                        }

                    })

                } else {

                    callback(400, {error: 'Password did not match the specified users passowrd'})
                }

            } else {

                callback(400, {error: 'Could not find the specified user'})
            }

        })
    }

}


tokenHandler.put = () => {

}


tokenHandler.delete = () => {
    
}


module.exports = tokenHandler