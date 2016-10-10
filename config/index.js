var config = {
  production: {
    
    database: 'mongodb://systango:systango1@ds047325.mlab.com:47325/livestreaming',
    
  },
  devalopment: {
    
    database: 'mongodb://localhost:27017/canvas',
    
  }
}

exports.get = function get(env) {
  return config[env] || config.development;
}