
let environments = {}

environments.stagging = {
    envName: 'stagging',
    port: 3000
}

environments.production = {
    envName: 'production',
    port: 5000
}

const currentEnvironment =  typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

const currentEnvironmentToExport =  typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments['stagging']

module.exports = currentEnvironmentToExport