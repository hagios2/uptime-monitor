const http = require('http')
const url = require('url')


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

    //send the response
    res.end('Hello World\n')

    console.log('Request recieved with these headers: ', headers)

})


server.listen(3000, function(){
    console.log('The server is listening on port 3000')
} )