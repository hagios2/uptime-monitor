
let environments = {}

environments.stagging = {
    envName: 'stagging',
    httpsPort: 4001,
    httpPort: 4000,
    hashingSecret: 'thisIsASecret',
    maxChecksLimit: 5,
    twillio: {
        accountId: 'ACb32d411ad7fe886aac54c665d25e5c5d',
        authToken: '9455e3eb3109edc12e3d8c92768f7a67',
        fromPhone: '+15005550006'
    },
    templateGlobals: {
        appName: 'UpptimeChecker',
        companyName: 'Seawil Inc',
        yearCreated: Date.now(),
        baseUrl: 'https://localhost:5000'
    }
}

environments.production = {
    envName: 'production',
    httpPort: 5000,
    httpsPort: 5001,
    hashingSecret: 'thisIsASecret',
    maxChecksLimit: 5,
    twillio: {
        accountId: 'ACb32d411ad7fe886aac54c665d25e5c5d',
        authToken: '9455e3eb3109edc12e3d8c92768f7a67',
        fromPhone: '+15005550006'
    }
}

const currentEnvironment =  typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

const currentEnvironmentToExport =  typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments['stagging']

module.exports = currentEnvironmentToExport