const { checkLogin,cleanCache,AppUpdateManager } = require('./util/index.js')
App({
  onLaunch(options) {
    cleanCache(()=>{
      checkLogin()
    })
    AppUpdateManager()
    console.log('App Launch', options);
    console.log('getSystemInfoSync', dd.getSystemInfoSync());
    console.log('SDKVersion', dd.SDKVersion);
  },
  onShow() {
    console.log('App Show');
  },
  onHide() {
    console.log('App Hide');
  },
  globalData: {
    hasLogin: false,
  },
});
