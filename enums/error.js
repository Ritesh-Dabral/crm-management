module.exports  = {
  'authError':{
    ERROR_RESOURCE_ABSENT_404 : 'ERROR_RESOURCE_ABSENT_404', // the requested resource doesn't exist
    ERROR_PLAN_CREATION: 'ERROR_PLAN_CREATION', // Vendor 'plan' creation api failed
    ERROR_SUBSCRIPTION_CREATION: 'ERROR_SUBSCRIPTION_CREATION', // Vendor 'subscription' creation api failed
    ERROR_ORDER_CREATION: 'ERROR_ORDER_CREATION', // Vendor 'order' creation api failed
    ERROR_GENERAL_API_FAILURE: 'ERROR_GENERAL_API_FAILURE', // api failed due to any other reason
    ERROR_WEBHOOK_VERIFY: 'ERROR_WEBHOOK_VERIFY' // Vendor webhook signature doesn't match
  },
  'genericError': {
    'serverError': 'ERROR_SERVER_500', // Unhandled or server errors,
    'unAuthorized': 'ERROR_AUTH_401', // Auth check failed
    'badRequest': 'ERROR_BAD_REQ_400', // Bad request
    'forbidden': 'ERROR_FORBIDDEN_403', // FORBIDDEN
    'notImplemented': 'NOT_IMPLIMENTED_501', // Not Implemented
    'notFound': 'ERROR_NOT_FOUND_404', // NOT FOUND
    'requestTimeOut': 'ERROR_REQ_TIMEOUT_408', // REQ TIMEOUT,
    'tokenExpired': 'ERROR_AUTH_401',
    'JsonWebTokenError': 'ERROR_AUTH_401'
  },
  'dbErrors': {
    '11000': 'Duplicate entry found', // mongo error for dulicate entry of a unique key
  },
  'permissionsError':{
    'notFound': 'No suitable permission found'
  }
}
