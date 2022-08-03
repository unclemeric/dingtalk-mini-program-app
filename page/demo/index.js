const { version } = require('../../util/index.js')
Page({
  data: {
    version: version,
    menus: [
      {
        icon: '/image/main-icon-01.png',
        name: '申请发起',
        url: '/page/subsidy/apply/apply'
      },
      // {
      //   icon: '/image/main-icon-02.png',
      //   name: '申请审核'
      // },
      {
        icon: '/image/main-icon-03.png',
        name: 'GPS安装登记',
        url: '/page/subsidy/gps-install-register/gps-install-register'
      },
      {
        icon: '/image/main-icon-04.png',
        name: 'GPS损坏更换',
        url: '/page/subsidy/gps-replace/gps-replace?type=1'
      },
      {
        icon: '/image/main-icon-05.png',
        name: 'GPS退还',
        url: '/page/subsidy/gps-replace/gps-replace?type=2'
      },
      {
        icon: '/image/main-icon-06.png',
        name: '证件保单变更',
        url: '/page/subsidy/certificate-policy-update/certificate-policy-update'
      }
    ]
  },
  pageTo(e) {
    let url = e.target.dataset.url
    dd.navigateTo({
      url: url
    })
  },
  onLoad() {
    dd.setNavigationBar({
      // title: '你好',
      backgroundColor: '#436dff',
      success() {
      },
      fail() {
      },
    });
  },
});
