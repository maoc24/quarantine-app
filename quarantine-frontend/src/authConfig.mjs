// src/authConfig.mjs
export const msalConfig = {
  auth: {
    clientId: '93df8ed7-f90f-44b8-b42c-862df73f18e2',
    // Usamos /common para no tener que pasar el GUID como “tenant”
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:5173'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
};

export const loginRequest = {
  scopes: [
    'openid',
    'profile',
    'api://47286e1b-2351-432d-90ef-0080252fe31b/user_impersonation'
  ]
};