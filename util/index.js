export const AppUpdateManager = function () {
  const updateManager = dd.getUpdateManager()
  updateManager.onCheckForUpdate(function (res) {
    // 请求完新版本信息的回调
    dMessage.toast('已经是最新版本了', { type: 'info' })
    console.log(res.hasUpdate) // 是否有更新
  })
  updateManager.onUpdateReady(function (ret) {
    console.log(ret.version) // 更新版本号
    dd.confirm({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success: function (res) {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate()
        }
      },
    })
  })
  updateManager.onUpdateFailed(function () {
    // 新版本下载失败
    dd.showToast({
      type: 'exception',
      content: '新版本下载失败',
      duration: 3000,
      success: function () {},
    })
  })
}
/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string') {
      if (/^[0-9]+$/.test(time)) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

export const domain = 'https://XXX.XXX.com/api'
export const tokenCookieKey = 'app-token'
export const userCookieKey = 'app-user'
export const version = 'V1.0.8'
export const cleanCache = function (cb) {
  dd.removeStorageSync({
    key: userCookieKey,
  })
  dd.removeStorageSync({
    key: tokenCookieKey,
  })
  cb && cb()
}
export const checkLogin = function (cb) {
  const token = getToken()
  if (!token) {
    authLogin(cb)
  } else {
    cb && cb()
  }
}
export const getToken = function () {
  const result = dd.getStorageSync({ key: tokenCookieKey })
  return result.data || ''
}
export const getUser = function () {
  const result = dd.getStorageSync({ key: userCookieKey })
  return result.data || {}
}
export const setLoginCookies = function (user) {
  if (!user || !user.token) {
    return false
  }
  cleanCache(() => {
    dd.setStorageSync({ key: userCookieKey, data: user })
    dd.setStorageSync({ key: tokenCookieKey, data: user.token || '' })
  })
}
export const authLogin = function (cb) {
  dd.showLoading()
  dd.getAuthCode({
    success: (res) => {
      dd.httpRequest({
        url: apis.auth,
        method: 'get',
        data: {
          authCode: res.authCode,
        },
        dataType: 'json',
        success: (res) => {
          dd.hideLoading()
          if (res && res.data.errcode === 0) {
            setLoginCookies(res.data)
            cb && cb()
          } else {
            dd.alert({ content: JSON.stringify(res) })
          }
        },
        fail: (res) => {
          dd.hideLoading()
          dd.alert({ content: JSON.stringify(res) })
        },
        complete: (res) => {
          dd.hideLoading()
        },
      })
    },
    fail: (err) => {
      console.log('getAuthCode failed --->', err)
      dd.alert({
        content: JSON.stringify(err),
      })
    },
  })
}

const url_prefix = domain + '/platform/motorbike-allowance'
export const apis = {
  auth: domain + '/dingtalk/user/getUserId',
  // findFailedApply: url_prefix + '/motor/motorAllowanceApply/findFailedApply', //查询申请失败的数据
}

export const dRequest = function (url, data, method = 'GET', header = {}) {
  return new Promise((resolve, reject) => {
    dd.httpRequest({
      headers: Object.assign(
        {
          'Content-Type': 'application/json',
          Authorization: getToken() || '',
        },
        header
      ),
      url: url,
      method: method,
      timeout: 60000,
      data: method === 'POST' ? JSON.stringify(data) : data,
      dataType: 'json',
      success: (res) => {
        console.log(res)
        resolve(res)
      },
      fail: async (err) => {
        if (err.status === 401) {
          await authLogin()
          resolve(await dRequest(url, data, method, header))
        } else {
          console.log(err)
          reject(err)
        }
      },
      complete: (res) => {},
    })
  }).catch((err) => {
    dMessage.hideLoading()
    console.log(err)
    dMessage.toast(err.message || err.msg || err.errorMessage || err.toString(), { type: 'exception' })
  })
}

export const dMessage = {
  alert: function (content, options) {
    let { title = '提示', buttonText = '确定', success = function () {} } = options || {}
    if (!content) return false
    dd.alert({
      title,
      content,
      buttonText,
      success,
    })
  },
  confirm: function (content, { title = '提示', confirmButtonText = '确定', cancelButtonText = '取消', success = function () {} }) {
    dd.confirm({
      title,
      content,
      confirmButtonText,
      cancelButtonText,
      success,
    })
  },
  toast: function (content, { type, duration = 3000, success = function () {} }) {
    dd.showToast({
      type,
      content,
      duration,
      success,
    })
  },
  showLoading: function (content) {
    dd.showLoading({
      content,
    })
  },
  hideLoading: function () {
    dd.hideLoading()
  },
  actionSheet: function (items = [], title = '请选择', success = function () {}, { cancelButtonText = '取消' }) {
    dd.showActionSheet({
      title,
      items,
      cancelButtonText,
      success,
    })
  },
}

export const ddCompress = (filePath, compressLevel) => {
  return new Promise((resolve, reject) => {
    // 压缩级别，支持 0 ~ 4 的整数，默认 4。
    // 0：低质量。
    // 1：中等质量。
    // 2：高质量。
    // 3：不压缩。
    // 4：根据网络适应。
    dd.compressImage({
      filePaths: [filePath],
      compressLevel: compressLevel || 2,
      success: (res) => {
        resolve(res.filePaths[0])
      },
    }).catch((e) => {
      resolve('')
    })
  })
}
