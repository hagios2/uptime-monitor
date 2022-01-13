const path = require('path')
const fs = require('fs')
const http = require('http')
const https = require('https')
const url = require('url')
const helpers = require('./helpers')
const _data = require('./data')

const workers = {}


workers.gatherAllChecks = () => {

    _data.list('checks', (err, checks) => {

        if (!err && checks && checks.length > 0) {

            checks.forEach(check => {
                
                _data.read('checks', check, (err, originalCheckData) => {

                    if (!err && originalCheckData) {

                        workers.validateCheckData(originalCheckData)

                    } else {

                        console.log(`Error reading ${check}.json `)
                    }
                })
            });
        } else {

            console.log('Could not find any checks to process')
        }
    })
}

//sanity checkingg the checkData
workers.validateCheckData = (originalCheckData) => {

    originalCheckData = typeof(originalCheckData) === 'object' && originalCheckData !== null ? originalCheckData : {}

    originalCheckData.id = typeof(originalCheckData.id) === 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false 

    originalCheckData.phoneNumber = typeof(originalCheckData.phoneNumber) === 'string' && originalCheckData.phoneNumber.trim().length == 10 ? originalCheckData.phoneNumber.trim() : false 
    
    originalCheckData.protocol = typeof(originalCheckData.protocol) === 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false 

    originalCheckData.url = typeof(originalCheckData.url) === 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false 

    originalCheckData.method = typeof(originalCheckData.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false 

    originalCheckData.successCode = typeof(originalCheckData.successCode) === 'object' && originalCheckData.successCode instanceof Array && originalCheckData.successCode.length > 0 ? originalCheckData.successCode : false 

    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5  ? originalCheckData.timeoutSeconds : false 

    //set  keys if not already set on the checkData
    originalCheckData.state = typeof(originalCheckData.state) === 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down' 

    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false

    if ( originalCheckData.id &&
         originalCheckData.phoneNumber && 
         originalCheckData.protocol && originalCheckData.url &&
         originalCheckData.method &&
         originalCheckData.successCode && 
         originalCheckData.timeoutSeconds
        ) {
            workers.performCheck(originalCheckData)

        } else {

            console.log('Error: one of the checks is not properly formatted. Skipping it')
        }
}


workers.performCheck = (originalCheckData) => {

    //perform the original check outcome 
    let checkOutcome = {
        error: false,
        responseCode: false
    }

    let outcomeSent = false

    //parse hostname and path out of original check data
    const parseUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true)
    const hostname = parseUrl.hostname
    const path = parseUrl.path

    const requestDetails =  {
        protocol: originalCheckData.protocol + ':',
        hostname,
        method: originalCheckData.method.toUpperCase(),
        path,
        timeout: originalCheckData.timeoutSeconds * 1000,
    }

    //check protocol to use
    const moduleToUse = originalCheckData.protocol === 'http' ? http : https

    const request = moduleToUse.request(requestDetails, (response) => {

        checkOutcome.responseCode = response.statusCode

        if (!outcomeSent) {
            workers.processCheckOutCome(originalCheckData, checkOutcome)

            outcomeSent = true
        }
    })

    request.on('error', (e) => {
        checkOutcome.error = {
            error: true,
            value: e
        }

        if (!outcomeSent) {
            workers.processCheckOutCome(originalCheckData, checkOutcome)

            outcomeSent = true
        }
    })

    request.on('timeout', (e) => {
        checkOutcome.error = {
            error: true,
            value: 'timeout'
        }

        if (!outcomeSent) {
            workers.processCheckOutCome(originalCheckData, checkOutcome)

            outcomeSent = true
        }
    })

    request.end()
     
}

// process check outcome and update check data as needed
workers.processCheckOutCome = (originalCheckData, checkOutcome) => {

    const state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCode.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down'

    //decide if an alert is wanted
    const alertwarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false

    ///update check data
    let newCheckData = originalCheckData

    newCheckData.state = state
    newCheckData.lastChecked = Date.now()

      
    _data.update('checks', newCheckData.checkId, newCheckData, (err) => {

        if (!err) {

            if (alertwarranted) {
                workers.alertUserToStatusChange(newCheckData)

            } else {
                console.log('Check outcome has not changed, no alert needed')
            }

        } else {

            console.log(`Error reading ${check}.json `)
        }
    })
}

//timer to execute the worker-process once per minute
workers.loop = () => {

    setInterval(() => {

        workers.gatherAllChecks()

    }, 1000 * 60)
}

workers.init = () => {

    //execute function to gather all checks 
    workers.gatherAllChecks()

    // execute the worker loop function 
    workers.loop()
}



module.export = workers  