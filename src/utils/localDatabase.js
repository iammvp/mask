const Datastore = require('nedb')
const path = require('path')
const {app, remote} = require('electron')

const dbPath = process.type === 'browser' ? app.getPath('userData') : remote.app.getPath('userData')

const proxySettingDB = new Datastore({
  autoload: true,
  filename: path.join(dbPath, '/proxySetting.db')
})

const proxyRuleDB = new Datastore({
  autoload: true,
  filename: path.join(dbPath, '/ruleLists.db')
})

const privilegeDB = new Datastore({
  autoload: true,
  filename: path.join(dbPath, '/privilege.db')
})

module.exports = {
  proxySettingDB,
  proxyRuleDB,
  privilegeDB
}
