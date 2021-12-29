
let environments = {}

environments.stagging = {
    envName: 'stagging',
    httpsPort: 3001,
    httpPort: 3000,
    hashingSecret: 'thisIsASecret',
    maxChecksLimit: 5
}

environments.production = {
    envName: 'production',
    httpPort: 5000,
    httpsPort: 5001,
    hashingSecret: 'thisIsASecret',
    maxChecksLimit: 5
}

const currentEnvironment =  typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

const currentEnvironmentToExport =  typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments['stagging']

module.exports = currentEnvironmentToExport