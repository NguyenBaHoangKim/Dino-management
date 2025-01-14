import openapi from 'openapi-validator-middleware'
import config from '#configs/environment'

const { validate } = openapi

openapi.init(config.openApiPath, {
    formats: [
        { name: 'password', pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/ },
    ],
})

export default validate