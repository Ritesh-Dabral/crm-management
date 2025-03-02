module.exports = {
  'authStrategy': {
    GOOGLE: 'GOOGLE',
    PASSWORD: 'PASSWORD',
    OTP: 'OTP',
    APPLE:'APPLE'
  },
  'passwordHashAlgo':{
    BCRYPT: 'bcrypt',
    MD5: 'md5'
  },
  'defaultUserPermissions':{
    'spyne': 'SPYNE_STANDARD',
    'enterprise': 'ENTERPRISE_STANDARD',
    'team': 'TEAM_STANDARD'
  },
  'onBoardingUserPermissions':{
    'enterprise': 'ENTERPRISE_OWNER',
    'team': 'TEAM_ADMIN'
  },
  'permissionTypes':{
    READ: 'READ',
    WRITE: 'WRITE'
  }
}
