const config = require("./config")
const handlers = require("./usersHandler")
const queryString = require('querystring')
const https = require('https')

let smsHandlers = {}

smsHandlers.sendTwilloSms = (phoneNumber, message, callback) => {

    phoneNumber = String(phoneNumber) && phoneNumber.trim().length == 10 ? phoneNumber.trim() : false

    message = String(message) && message.trim().length > 0 && message.trim().length < 100 ? message.trim() : false

    if (message && phoneNumber) {

        const payload = {

            From: config.twillo.fromPhone,
            To: `${phoneNumber}`,
            Body: message
        }
    
        const payloadString = queryString.stringify(payload)
    
        const requestDetails =  {
            protocol: 'https:',
            hostname: 'api.twillo.com',
            method: 'POST',
            path: `2010-04-01/Accounts/${config.twillio.accountId}/Messages.json` ,
            auth: `${config.twillio.accountId}:${config.twillio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(payloadString)
            } 
        }

        const request = https.request(requestDetails, (response) => {

            const responseStatus = response.statusCode

            if (responseStatus === 200 || responseStatus === 201 || responseStatus === 302 || responseStatus === 301) {

                callback(false)

            } else {

                callback('Status code returned was ' + responseStatus)
            }
        })

        request.on('error', (e) => {
            callback(e)
        })

        request.write(payloadString)

        request.end()


    } else {

        callback('Given parameters were missing or invalid')
    }
  
}


smsHandlers.smsApi = (phoneNumber, message, callback) => {

    const source = 'Kedebah'

    const url = `https://deywuro.com/api/sms?username=kedebah&password=mv6@@hx&source=${source}&destination=${phoneNumber}&message=${message}`

    const request = https.get(url, (response) => {

        const responseStatus = response.statusCode

        if (responseStatus === 200 || responseStatus === 201 || responseStatus === 302 || responseStatus === 301 ) {

            callback(200, {message: 'sms sent'})

        } else {

            callback('Status code returned was ' + responseStatus)
        }
    })

    request.on('error', (e) => {
        callback(e)
    })

}



module.exports = smsHandlers