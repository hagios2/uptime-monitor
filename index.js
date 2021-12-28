const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const {router, handlers } = require('./lib/router.js')
const config = require('./lib/config')
const https = require('http')
const fs = require('fs')
const helpers = require('./lib/helpers')

//create server to handle all requests
const httpServer = http.createServer(function(req, res){
    
    unifiedServer(req, res)
})


httpServer.listen(config.httpPort, function(){
    console.log('The server is listening on port ' + config.httpPort)
})


const httpsServerOptions = {

    key: fs.readFileSync('./https/key.pem'),
    
    cert: fs.readFileSync('./https/cert.pem')
}

const httpsServer = https.createServer(httpsServerOptions, function(req, res){
    
    unifiedServer(req, res)
})


httpsServer.listen(config.httpsPort, function(){
    console.log('The server is listening on port ' + config.httpsPort)
} )


const unifiedServer = function (req, res) {

    //get and parse the url
    const parsedUrl = url.parse( req.url, true) 

    //get the path
    const path = parsedUrl.pathname

    //remove extraneous slashes
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')

    console.log(trimmedPath, 'trimmedpath')

    //get the string as an object
    const queryStringObject = parsedUrl.query

    //get the request method
    const method = req.method.toLowerCase()

    //get request headers
    const headers = req.headers

    //getthe request payload
    const decoder = new StringDecoder('utf-8')

    let payloadBuffer = ''

    //once the request emit data event to stream chunk of undecoded payload
    req.on('data', function(data){

        //append a decoded version of the data to the buffer variable
        payloadBuffer += decoder.write(data) 
    })

    //check request is done streaming payload
    req.on('end', function() {

        //end the buffer
        payloadBuffer += decoder.end()

        //find a matched handler for the route or notFound handler will be used instead
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

        // console.log(JSON.parse(payloadBuffer), 'payload object')

        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: JSON.parse(payloadBuffer)
        }

        //call the handler with the required params
        chosenHandler(data, function(statusCode, payload) {

            //check if statuscode is defined
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200

            //check if response payload is defined
            payload = typeof(payload) == 'object' ? payload : {}

            //stingify payload
            const responsePayload = JSON.stringify(payload)

            res.setHeader('Content-Type', 'application/json')
            //send status code
            res.writeHead(statusCode)

            //return response payload
            res.end(responsePayload)

            console.log('Returning response with these statuscode: ', statusCode, 'with payload', responsePayload)
        })

    })
}