const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const {router, handlers } = require('./router.js')
const config = require('./config')
const https = require('http')
const fs = require('fs')
const helpers = require('./helpers')
const path = require('path')
const util = require('util')

const debug = util.debuglog('server')
const server = {}

//create server to handle all requests
server.httpServer = http.createServer((req, res) => {
    
    server.unifiedServer(req, res)
})

server.httpsServerOptions = {

    key: fs.readFileSync(path.join(__dirname,'../https/key.pem')),
    
    cert: fs.readFileSync(path.join(__dirname,'../https/cert.pem'))
}

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    
    server.unifiedServer(req, res)
})

server.unifiedServer = (req, res) => {

    //get and parse the url
    const parsedUrl = url.parse( req.url, true) 

    //get the path
    const path = parsedUrl.pathname

    //remove extraneous slashes
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')

    //get the query string as an object
    const queryStringObject = parsedUrl.query

    //get the request method
    const method = req.method.toLowerCase()

    //get request headers
    const headers = req.headers

    //getthe request payload
    const decoder = new StringDecoder('utf-8')

    let payloadBuffer = ''

    //once the request emit data event to stream chunk of undecoded payload
    req.on('data', (data) => {

        //append a decoded version of the data to the buffer variable
        payloadBuffer += decoder.write(data) 
    })

    //check request is done streaming payload
    req.on('end', function() {

        //end the buffer
        payloadBuffer += decoder.end()

        //find a matched handler for the route or notFound handler will be used instead
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: payloadBuffer == '' ? {} : JSON.parse(payloadBuffer)
        }

        //call the handler with the required params
        chosenHandler(data, (statusCode, payload) => {

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

            //if the response is 200 print green else print red
            if (statusCode === 200) {
                debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`)
            } else {
                debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`)
            }
        })

    })
}

server.init = () => {

    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[36m%s\x1b[0m', 'The server is listening on port ' + config.httpPort)
    })
    
    
    server.httpsServer.listen(config.httpsPort, () => {
        console.log('\x1b[35m%s\x1b[0m', 'The server is listening on port ' + config.httpsPort)
    } )
    
}


server.init()


module.export = server