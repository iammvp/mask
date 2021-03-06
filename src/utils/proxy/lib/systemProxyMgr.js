'use strict'
// steal from anyproxy
const child_process = require('child_process')

const networkTypes = ['Ethernet', 'Thunderbolt Ethernet', 'Wi-Fi']

function execSync (cmd) {
  let stdout,
    status = 0
  try {
    stdout = child_process.execSync(cmd)
  } catch (err) {
    stdout = err.stdout
    status = err.status
  }

  return {
    stdout: stdout.toString(),
    status
  }
}

/**
 * proxy for CentOs
 * ------------------------------------------------------------------------
 *
 * file: ~/.bash_profile
 *
 * http_proxy=http://proxy_server_address:port
 * export no_proxy=localhost,127.0.0.1,192.168.0.34
 * export http_proxy
 * ------------------------------------------------------------------------
 */

/**
 * proxy for Ubuntu
 * ------------------------------------------------------------------------
 *
 * file: /etc/environment
 * more info: http://askubuntu.com/questions/150210/how-do-i-set-systemwide-proxy-servers-in-xubuntu-lubuntu-or-ubuntu-studio
 *
 * http_proxy=http://proxy_server_address:port
 * export no_proxy=localhost,127.0.0.1,192.168.0.34
 * export http_proxy
 * ------------------------------------------------------------------------
 */

/**
 * ------------------------------------------------------------------------
 * mac proxy manager
 * ------------------------------------------------------------------------
 */

const macProxyManager = {}
macProxyManager.cmdPrefix = `/usr/bin/osascript -e 'do shell script`
macProxyManager.cmdSuffix = `with administrator privileges`
macProxyManager.getPrivilegeState = () => {
  const user = global.state.Privilege.user
  child_process.exec(`${macProxyManager.cmdPrefix} "echo hello" ${macProxyManager.cmdSuffix} user name "${user.username}" password "${user.password}"'`, (err, stdout, stderr) => {
    if (err) { // password error
      global.commit('NOT_GRANT_PRIVILEGE')
    } else { // get privilege
      global.commit('GRANTED_PRIVILEGE')
      if (global.state.Privilege.isLoad === false) {
        // not load, so we need insert in local database
        global.dispatch('insertUserInfo', user)
      } else {
        if (global.state.Privilege.hasError === true) {
          // load but has error, we need update our database
          global.dispatch('updateUserInfo', user)
        }
      }
    }
  })
}

macProxyManager.getNetworkType = () => {
  for (let i = 0; i < networkTypes.length; i++) {
    const type = networkTypes[i],
      result = execSync('networksetup -getwebproxy ' + type)

    if (result.status === 0) {
      macProxyManager.networkType = type
      return type
    }
  }

  throw new Error('Unknown network type')
}

macProxyManager.enableGlobalProxy = (port) => {
  if (!port) {
    console.log('failed to set global proxy server.\n ip and port are required.')
    return
  }
  const networkType = macProxyManager.networkType || macProxyManager.getNetworkType()
  const cmd = `networksetup -setwebproxy ${networkType} 127.0.0.1 ${port} && networksetup -setsecurewebproxy ${networkType} 127.0.0.1 ${port}`
  const user = global.state.Privilege.user
  child_process.exec(`${macProxyManager.cmdPrefix} "${cmd}" ${macProxyManager.cmdSuffix} user name "${user.username}" password "${user.password}"'`, (err, stdout, stderr) => {
    if (err) throw err
  })
  // return execSync(`networksetup -setwebproxy ${networkType} 127.0.0.1 ${port} && networksetup -setsecurewebproxy ${networkType} 127.0.0.1 ${port}`)
}

macProxyManager.disableGlobalProxy = () => {
  const networkType = macProxyManager.networkType || macProxyManager.getNetworkType()
  const cmd = `networksetup -setwebproxystate ${networkType} off && networksetup -setsecurewebproxystate ${networkType} off`
  const user = global.state.Privilege.user
  child_process.exec(`${macProxyManager.cmdPrefix} "${cmd}" ${macProxyManager.cmdSuffix} user name "${user.username}" password "${user.password}"'`, (err, stdout, stderr) => {
    if (err) throw err
  })
  // return execSync(`networksetup -setwebproxystate ${networkType} off && networksetup -setsecurewebproxystate ${networkType} off`)
}

macProxyManager.getProxyState = () => {
  const networkType = macProxyManager.networkType || macProxyManager.getNetworkType()
  const result = execSync(`networksetup -getwebproxy ${networkType}`)

  return result
}

/**
 * ------------------------------------------------------------------------
 * windows proxy manager
 *
 * netsh does not alter the settings for IE
 * ------------------------------------------------------------------------
 */

const winProxyManager = {}

winProxyManager.enableGlobalProxy = (port) => {
  if (!port) {
    console.log('failed to set global proxy server.\n ip and port are required.')
    return
  }

  return execSync(
    // set proxy
    `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d 127.0.0.1:${port} /f & reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f`)
}

winProxyManager.disableGlobalProxy = () => execSync('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f')

winProxyManager.getProxyState = () => ''

winProxyManager.getNetworkType = () => ''

module.exports = /^win/.test(process.platform) ? winProxyManager : macProxyManager
