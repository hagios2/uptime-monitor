const helpers = require("./helpers")

let pagesHandler = {}


pagesHandler.index = (data, callback) => {

    if (data.method == 'get') {
            // Prepare data for interpolation
        var templateData = {
            'head.title' : 'This is the title',
            'head.description' : 'This is the meta description',
            'body.title' : 'Hello templated world!',
            'body.class' : 'index'
        };
        helpers.getTemplate('index', templateData, (err, str) => {
            if (!err && str) {
               // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, (err,str) => {
                    if(!err && str){
                        // Return that page as HTML
                        callback(200, str,'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                })
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