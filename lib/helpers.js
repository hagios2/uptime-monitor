const crypto = require('crypto')
const config = require('./config')
const path = require('path')
const fs = require('fs')


const helpers = {}

helpers.getTemplate = (templateName, data, callback) => {
    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false

    data = typeof(data) === 'object' && data !== null ? data : {}

    if (templateName) {
        const templateDir = path.join(__dirname, '../templates/')

        fs.readFile(`${templateDir}${templateName}.html`, 'utf8', (err, str) => {
            if (!err && str.length > 0) {

                let finalString = helpers.interpolate(str, data)
                // console.log(err, str)
                callback(false, finalString)
            } else {
                // console.log(err, str)
                callback('Template not found')
            }
        })
    } else {
        callback('A valid template name was not specified')
    }
}

// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
helpers.addUniversalTemplates = (str,data,callback) => {
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};
    // Get the header
    helpers.getTemplate('_header',data,(err,headerString) => {
      if(!err && headerString){
        // Get the footer
        helpers.getTemplate('_footer',data, (err,footerString) => {
          if(!err && headerString){
            // Add them all together
            var fullString = headerString+str+footerString;
            callback(false,fullString);
          } else {
            callback('Could not find the footer template');
          }
        });
      } else {
        callback('Could not find the header template');
      }
    });
  };


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

helpers.interpolate = (str, data) => {
    str = typeof(str) === 'string' && str.length > 0 ? str : '',
    data = typeof(data) === 'object' && data !== null ? data : {}

    for(let keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data['global'+keyName] = config.templateGlobals[keyName]
        }
    }

    for (let key in data) {
        if (data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
            let replace = data[key]

            let find = `{${key}}`

            str = str.replace(find, replace)
        }
    }
}


module.exports = helpers