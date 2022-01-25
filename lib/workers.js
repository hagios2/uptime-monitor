const path = require('path')
const fs = require('fs')
const http = require('http')
const https = require('https')
const url = require('url')
const helpers = require('./helpers')
const _data = require('./data')
const smsHandler = require('./smsHandler')
const workers = {}
const _logs = require('./_logs')

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

            console.log('Error: could not find any checks to process')
        }
    })
}

//sanity checkingg the checkData
workers.validateCheckData = (originalCheckData) => {

    originalCheckData = typeof(originalCheckData) === 'object' && originalCheckData !== null ? originalCheckData : {}

    originalCheckData.id = typeof(originalCheckData.checkId) === 'string' && originalCheckData.checkId.trim().length == 20 ? originalCheckData.checkId.trim() : false 

    originalCheckData.phoneNumber = typeof(originalCheckData.phoneNumber) === 'string' && originalCheckData.phoneNumber.trim().length == 10 ? originalCheckData.phoneNumber.trim() : false 
    
    originalCheckData.protocol = typeof(originalCheckData.protocol) === 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false 

    originalCheckData.url = typeof(originalCheckData.url) === 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false 

    originalCheckData.method = typeof(originalCheckData.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false 

    originalCheckData.successCodes = typeof(originalCheckData.successCodes) === 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false 

    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5  ? originalCheckData.timeoutSeconds : false 

    //set  keys if not already set on the checkData
    originalCheckData.state = typeof(originalCheckData.state) === 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down' 

    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false

    if ( originalCheckData.checkId &&
         originalCheckData.phoneNumber && 
         originalCheckData.protocol && originalCheckData.url &&
         originalCheckData.method &&
         originalCheckData.successCodes && 
         originalCheckData.timeoutSeconds
        ) {
            workers.performCheck(originalCheckData)

        } else {

            console.log('Error: one of the checks is not properly formatted. Skipping it...')
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
    const _moduleToUse = originalCheckData.protocol === 'http' ? http : https

    const request = _moduleToUse.request(requestDetails, (response) => {

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

    const state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down'

    //decide if an alert is wanted if state changed from the previous time
    const alertwarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false

    const timeOfCheck = Date.now()

    workers.log(originalCheckData, checkOutcome, state, alertwarranted, timeOfCheck)

    ///update check data
    let newCheckData = originalCheckData

    newCheckData.state = state
    newCheckData.lastChecked = timeOfCheck
      
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

workers.log = (originalCheckData, checkOutcome, state, alertwarranted, timeOfCheck) => {
    //form the log data
    const logData = {
        check: originalCheckData,
        state,
        alert: alertwarranted,
        time: timeOfCheck,
        outcome: originalCheckData
    }

    const logString = JSON.stringify(logData)

    const logFileName = originalCheckData.checkId

    _logs.append(logFileName, logString, (err) =>{
        if (!err) {
            console.log('Logging to file succeeded')
        } else {
            console.log('Logging to file failed')
        }
    })
}

workers.alertUserToStatusChange = (newCheckData) => {
    const number = `233${newCheckData.phoneNumber.substr(1)}`

    const message = `Alert:  your check for new check data ${newCheckData.method.toUpperCase()}${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`

    smsHandler.sendTwilloSms(number, message, (err) => {
        if(!err) {
            console.log('success: user was alerted to a status change in their check via sms', message)
        } else {
            console.log('error: could not send alert to user of status change')
        }
    })
}
 
//timer to execute the worker-process once per minute
workers.loop = () => {

    setInterval(() => {

        workers.gatherAllChecks()

    }, 1000 * 60)
}

workers.rotateLogs = () => {
    // list all non compressed log files
    _logs.list(false,  (err, logs) => {
        if (!err && logs.length > 0) {
            logs.forEach((logName) => {
                const logId = logName.replace('.log', '')
                const newFileId = `${logId}-${Date.now()}`

                _logs.compress(logId, newFileId, (err) => {
                    if (!err) {
                        _logs.truncate(logId, (err) => {
                            if (!err) {
                                console.log('Success truncating logFile')
                            } else {
                                console.log('Error truncating logFile')
                            }
                        })
                    } else {
                        console.log('Error compressing one of the log files', err)
                    }
                })
            })
        }
    })
}


workers.logRotationLoop = () => {

    setInterval(() => {

        workers.rotateLogs()

    }, 1000 * 60 * 60 * 24)   
}

workers.init = () => {
    //execute function to gather all checks 
    workers.gatherAllChecks()

    // execute the worker loop function 
    workers.loop()

    //comppress the logs for the day
    workers.rotateLogs();

    //Call the compression loop so logs will be compressed later on 
    workers.logRotationLoop()
}


workers.init()


module.export = workers  