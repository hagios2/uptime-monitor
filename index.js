const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder


//create server to handle all requests
const server = http.createServer(function(req, res){
    
    //get and parse the url
    const parsedUrl = url.parse( req.url, true) 

    //get the path
    const path = parsedUrl.pathname

    //remove extraneous slashes
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')

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

        //send the response
        res.end('Hello World\n')

        console.log('Request recieved with these headers: ', headers, 'with payload', payloadBuffer)

    })
})


server.listen(3000, function(){
    console.log('The server is listening on port 3000')
} )