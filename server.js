const express = require('express')
const bodyParser = require('body-parser')
const validUrl = require('valid-url')
const ejs = require('ejs')
const fs = require('fs')


const PORT = process.env.PORT || 8000
const filePath = './data/links.json'
const app = express()



const checkArrayForLink =  (arr, url) => arr.find(obj => obj.URL === url)
const testIdNum = num => !!Number(num)


app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))

app.use((req,res,next) => {
    res.locals.link = ''
    res.locals.error = ''
    next()
    }
)
app.get('/', (req, res) => {
    res.render('home')
})
app.get('/links/:id', (req, res) => {
    const id = req.params.id
        if(testIdNum(id)){
            fs.readFile(filePath, (err, data) => {
            if(err) throw err;
        
            const links = JSON.parse(data)
            
            links.forEach(link => {
                if(link.id === Number(id)){
                    res.redirect(link.URL)
                }
            })
            res.render('home', {'error' : 'Invalid ID'})
        })
    }
})

app.post('/', (req, res) => {
    const baseLink = `https://${req.headers.host}/links/`
    const url = req.body.desiredURL
    
    if(validUrl.isUri(url)){
        fs.readFile(filePath, (err, data) => {
            if(err) throw err;
            
            const links = JSON.parse(data)
            const foundRecord = checkArrayForLink(links, url)
            
            if(foundRecord){
                const miniURL = baseLink + foundRecord.id
                res.render('home', {link: miniURL})
            } else {
                const finalID = links[links.length - 1].id + 1
                links.push({"id": finalID, "URL": url})
                fs.writeFile(filePath, JSON.stringify(links))
                res.render('home', {link: baseLink.concat(finalID)})
            }
        })
    } else {
        res.render('home', {"error": "Invalid URL Syntax"})   
    }
})

app.listen(PORT, () => {
    console.log('Listening on :', PORT)
})