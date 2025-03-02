module.exports['swagger-generator'] = {
    disabled: true,
    swaggerJsonPath: './swagger/swagger.json',
    swagger: {
        openapi: '3.0.0',
        info: {
            title: 'imagecrew-node documentation',
            description: 'This is a generated swagger json documentation for your sails project \'imagecrew-node\'.',
            contact: {
                name: "",
                url: "",
                email: ""
              },
              termsOfService: "",
              license: {
                name: "",
                url: ""
              },
              version: ""
        },
    },
    defaults: {
        responses: {
            '200': { description: 'The requested resource' },
            '404': { description: 'Resource not found' },
            '500': { description: 'Internal server error' }
        }
    },
};
