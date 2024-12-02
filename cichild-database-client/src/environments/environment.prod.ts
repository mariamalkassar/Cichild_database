declare var require: any;
export const environment = {

  appVersion: require('../../package.json').version,
  production: true,
  apiURL: 'http://18.185.138.69:80/api/',
  mediaURL: 'http://18.185.138.69:80',
  frontendURL: 'http://18.185.138.69:8080'
};
