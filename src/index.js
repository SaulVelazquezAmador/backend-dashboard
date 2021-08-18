const express = require('express')
const cors = require('cors');
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 3050

const app = express()
app.use(bodyParser.json());

app.use(cors()) // Use this after the variable declaration

// MySql

const conection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'dashboard'
})

//Route

app.get('/get', (req, res) =>{
    const sql = "SELECT * FROM users";
    conection.query(sql, (error, results)=>{
        if (error) throw error
        if (results.length > 0)
            res.json(results)
        else{
            res.send("No results")
        }
    })
})
//all users

app.post('/post',(req, res) =>{
    const sql = "INSERT INTO users SET ?"
    const userObject = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        register: req.body.register,
        lastlogin: req.body.lastlogin
    }
    console.log(userObject.lastlogin)
    conection.query(sql, userObject, error =>{
        if (error) throw error
        else{
            res.send("Usuario agregado")
        }
    })
})
//  put
app.put('/put/:id',(request, res) =>{
    const {id}        = request.params;

    var lastlogin = ""
    var today     = new Date()
    var day       = today.getDate()
    var month     = today.getMonth()+1
    var year      = today.getFullYear()
    lastlogin = year.toString()+"-"+month.toString()+"-"+day.toString()

    const sql = `UPDATE users SET lastlogin = '${lastlogin}' WHERE id = '${id}'`

    conection.query(sql, error =>{
        if (error) throw error
        else{
            res.send("Fecha actualizada")
        }
    })
})

//check conection
conection.connect(error=>{
    if (error) throw error
    console.log("conected")
})

app.listen(PORT,()=>console.log(`server running on port ${PORT}`));