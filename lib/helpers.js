const crypto = require('crypto')
const config = require('./config')

const helpers = {}


helpers.hash = (str) => {

    if(typeof(str) == 'string' && str.length > 0) {

        return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')

    } else {
        return false
    }
}

helpers.parseJsonToObject = (str) => {

    try {

        return JSON.parse(str)
        
    } catch(e) {

        return {}
    }
}


helpers.createRandomString = (stringLength) => {

    if (Number(stringLength) && stringLength > 0) {

        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

        let randString = ''

        for (let i = 1; i <= stringLength; i ++) {

            randString += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length ))
        }

        return randString

    } else {

        return false
    }
}


module.exports = helpers