const express = require('express')
const bodyParser = require('body-parser')
const validUrl = require('valid-url')
const ejs = require('ejs')
const path = require('path')
const _ = require('lodash')
const fs = require('fs')

const filePath = path.resolve('./data/links.json')
const LINK_STORE = JSON.parse(fs.readFileSync(filePath))
const PORT = process.env.PORT || 8000
const INVALID_ID = 'Invalid ID'
const INVALID_URI = 'Invalid URL Syntax'
const app = express()

const findURL =  (arr, url) => arr.find(obj => obj.URL === url)
const testIdNum = num => !!_.isNumber(num)
const localVariables = (req,res,next) => {
    res.locals.link = ''
    res.locals.error = ''
    next()
}

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))

app.use(localVariables)
app.get('/', (req, res) => {
    res.render('home')
})
app.get('/links/:id', (req, res) => {
    const id = Number(req.params.id)
    
    if(testIdNum(id)){
        LINK_STORE.forEach(link => {
            if(link.id === Number(id)){
                res.redirect(link.URL)
            }
        })
    }
})

app.post('/', (req, res) => {
    const baseLink = `https://${req.headers.host}/links/`
    const url = req.body.desiredURL
    const respData = validUrl.isUri(url) ? generateUri(baseLink, url) : {"error": INVALID_URI} 
    res.render('home', respData)
    
})

const generateUri = (baseLink, url) => {
        
    const foundRecord = findURL(LINK_STORE, url)
    if(foundRecord){
        const foundURL = baseLink.concat(foundRecord.id)
        return {link: foundURL}
    }
    
    const newID = LINK_STORE[ LINK_STORE.length - 1].id + 1
    LINK_STORE.push({"id": newID, "URL": url})
    fs.writeFile(filePath, JSON.stringify(LINK_STORE))
    
    return {link: baseLink.concat(newID)}
}

app.listen(PORT, () => {
    console.log('Listening on :', PORT)
})