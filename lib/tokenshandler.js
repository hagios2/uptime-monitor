const _data = require('./data')
const helpers = require('./helpers')

let tokenHandler = {}

tokenHandler.tokens = (data, callback) => {

    const acceptableMethods = ['post', 'get', 'put', 'delete']

    if (acceptableMethods.indexOf(data.method) > -1) {

        tokenHandler._tokens[data.method](data, callback)
    } else{
        callback(405)
    }
} 

tokenHandler._tokens = {}

tokenHandler._tokens.get = (data, callback) => {

    const tokenId = typeof(data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.trim().length == 80 ? data.queryStringObject.tokenId.trim() : false

    if (tokenId) {
        
        _data.read('tokens', tokenId, (err, tokenData) => {

            if (!err && tokenData) {

                callback(200, tokenData)

            } else {

                callback(404)
            }

        })

    } else {

        callback(400, {Error: "Missing required field"})

    }
}


tokenHandler._tokens.post = (data, callback) => {

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


tokenHandler._tokens.put = (data, callback) => {

    const tokenId = typeof(data.payload.tokenId) == 'string' && data.payload.tokenId.trim().length == 80 ? data.payload.tokenId.trim() : false

    const extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false

    console.log(tokenId , 'token', extend, 'extend')
    if (tokenId && extend) {

        _data.read('tokens', tokenId, (err, tokenData) => {

            if (!err && tokenData) {

                if (tokenData.expires > Date.now()) {

                    tokenData.expires = Date.now() + 1000 * 60 * 60 

                    _data.update('tokens', tokenId, tokenData, (err) => {

                        if (!err) {
    
                            callback(200)
    
                        } else {
    
                            console.log(err)
    
                            callback(500, {error: 'Could not update token data'})
                        }
                    })

                }else {

                    callback(400, {error: 'Token has already expired and can not be extended'})
                }
            }
        })

    } else {

        callback(400, {error: "Missing required fields or given fields are invalidss"})
    } 
}


tokenHandler._tokens.delete = () => {
    
}


module.exports = tokenHandler