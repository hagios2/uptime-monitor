const helpers = require("./helpers")

let pagesHandler = {}


pagesHandler.index = (data, callback) => {

    if (data.method == 'get') {
        helpers.getTemplate('index', (err, str) => {
            if (!err && str) {
                callback(200, str, 'html')
            } else {
                console.log(err)
                callback(500, undefined, 'html')
            }
        })
    } else {
        callback(405, undefined, 'html')
    }
}


pagesHandler.deleteSession = () => {

}


module.exports = pagesHandler