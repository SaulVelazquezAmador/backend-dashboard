const express = require('express')
const cors = require('cors');
const mysql = require('mysql2')
const bodyParser = require('body-parser')
// const bodyParser = require('body-parser')
const PORT = process.env.PORT || 3050
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');
const app = express()
// app.use(bodyParser.json());

app.use(cors()) // Use this after the variable declaration

// MySql

const conection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'dashboard'
})

//Route

var jsonParser = bodyParser.json()

app.post('/login', jsonParser, (req, res) =>{
    const {email, password} = req.body

    const sql = "SELECT * FROM users";
    conection.query(sql, (error, results)=>{
        if (error) throw error
        if (results.length > 0){
            let id = null
            let name = ""

            results.forEach(r =>{
                if (r.email === email && r.password === password) {
                    id = r.id
                    name = r.name
                }
            })
            
            if (id){
                var lastlogin = ""
                var today     = new Date()
                var day       = today.getDate()
                var month     = today.getMonth()+1
                var year      = today.getFullYear()
                lastlogin = day.toString()+"-"+month.toString()+"-"+year.toString()
            
                const sql2 = `UPDATE users SET lastlogin = '${lastlogin}' WHERE id = '${id}'`
            
                conection.query(sql2, error =>{
                    if (error) throw error
                    else{
                        const token = jwt.sign(name, 'KEY');
                        res.json({ status: 200, name, token})                            
                    }
                })
            }
            else{
                res.json({ status: 404 })
            }
        }
    })
})
//all users

app.post('/post', jsonParser,(req, res) =>{
    const userObject = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        register: "",
        lastlogin: ""
    }
    
    if (userObject.name === undefined) return
    
    const sql = "SELECT * FROM users";
    conection.query(sql, (error, results)=>{
        if (error) throw error
        if (results){
            let exist = 0
            results.forEach(x => {
                if (x.email == userObject.email) {
                    exist = 1
                }
                if (x.name == userObject.name) {
                    exist = 1
                }
            })

            if (exist === 1) {
                res.send("Usuario existe")
            }
            else{
                let name = userObject.name
                const sql = "INSERT INTO users SET ?"
        
                var today     = new Date()
                var day       = today.getDate()
                var month     = today.getMonth()+1
                var year      = today.getFullYear()
                userObject.register = day.toString()+"-"+month.toString()+"-"+year.toString()
                userObject.lastlogin = day.toString()+"-"+month.toString()+"-"+year.toString()
            
                conection.query(sql, userObject, error =>{
                    if (error) throw error
                    else{
                        const token = jwt.sign(name, 'KEY');
                        res.json({status:200, name, token}) 
                    }
                })
            }
        }
    })
})

app.get('/protected', ensureToken, (req, res) =>{
    jwt.verify(req.token, 'KEY', (err, data)=>{
        if (err) {
            res.sendStatus(403)
        }
        else{
            const sql = "SELECT name, email, register, lastlogin FROM users";
            conection.query(sql, (error, results)=>{
                if (error) throw error
                else{
                    res.json({text:"protected", data: results})
                }
            })
        }
    })
})

function ensureToken(req, res, next){
    const bearerHeader = req.headers['authorization']

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ")
        const bearerToken = bearer[1]
        req.token = bearerToken
        next()
    }
    else{
        res.sendStatus(403)
    }
}

//check conection
conection.connect(error=>{
    if (error) throw error
    console.log("conected")
})

app.listen(PORT,()=>console.log(`server running on port ${PORT}`));