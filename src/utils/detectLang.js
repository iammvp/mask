const path = require('path')
const fs = require('fs')
const osLocale = require('os-locale')
function lang () {
  let langObj
  const locale = osLocale.sync()
  const filePath = path.join(global.rootPath, `/lang/${locale}.json`)
  if (fs.existsSync(filePath)) {
    langObj = fs.readFileSync(filePath, 'utf8')
  } else {
    const enLangPath = path.join(global.rootPath, '/lang/en_US.json')
    langObj = fs.readFileSync(enLangPath, 'utf8')
  }
  return JSON.parse(langObj)
}

module.exports = lang
