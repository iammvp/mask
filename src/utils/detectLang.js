const { app } = require('electron')
const path = require('path')
const fs = require('fs')

function lang () {
  let langObj
  const locale = app.getLocale()
  const filePath = path.join(__static, `/lang/${locale}.json`)
  if (fs.existsSync(filePath)) {
    langObj = fs.readFileSync(filePath, 'utf8')
  } else {
    const enLangPath = path.join(__static, '/lang/en-US.json')
    langObj = fs.readFileSync(enLangPath, 'utf8')
  }
  return JSON.parse(langObj)
}

module.exports = lang
