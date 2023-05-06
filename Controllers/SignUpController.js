const {Client} = require("pg")
const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')
const { data } = require("jquery")
const app = express()

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "Sushmanth",
    database: "DBProject"
})

client.connect()
.then(()=>{
    console.log('Connected successfully!')
})
.catch(()=>{
    console.log("Error in connecting to the DB")
})


app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
    extended: true
}))



exports.checkLoginDetails = async (req, res) => {

    var email = req.params.email;
    var pass = req.params.pass;
    var type = req.params.type;
    try
    {
        var doc = await client.query(`select * from users where email_address = '${email}' and password = '${pass}' and user_type = '${type}';`)

        if(doc.rows.length == 0)
        {
            res.status(200).json({
                status: "Failed",
                message: "No records Founds!",
                data : doc.rows
            })
        }else{
            res.status(200).json({
                status: "Success",
                message: "Data Found successfully!",
                data : doc.rows
            })
        }
    }
    catch(ex)
    {
        console.log(ex.message);
            res.status(400).json({
                status: "Failed",
                message: ex.message
            })
    }
}


exports.userSignUp = async (req, res) => {

    var user_id;
    var data = req.body;
    try
    {
        var doc = await client.query(`select max(user_id) from users;`);
        // console.log(doc.rows[0].max);

        if(doc.rows[0].max == null)
        {
            user_id = 1001;
        }else{
            user_id = doc.rows[0].max + 1
        }
        
        var user_doc = await client.query(`insert into users values (${user_id}, '${data.f_name}', '${data.m_name}', '${data.l_name}', '${data.email}', '${data.phone}', '${data.u_type}', '${data.pass}');`);

        if(data.u_type == "Agent")
        {
            var agent_doc = await client.query(`insert into agent values ('${data.job_title}', ${data.exp_years}, '${data.works_for}', '${user_id}');`);
        }else{
            var renter_doc = await client.query(`insert into renter values ('${data.budget}', '${data.pre_location}', '${data.move_date}', '${data.occup}', ${user_id});`);
        }

        res.status(200).json({
            status: "Success",
            message: "Data Inserted successfully!"
        })
    }
    catch(ex)
    {
        console.log(ex.message);
        res.status(400).json({
            status: "Failed",
            message: ex.message
        })
    }
}


exports.getUserDetails = async (req, res) => {

    var uid = req.params.uid;
    var utype = req.params.utype;

    try
    {
        if(utype == "Agent")
        {
            var doc = await client.query(`SELECT * FROM users JOIN agent ON users.user_id = agent.user_id where users.user_id = ${uid};`)
        }else
        {
            var doc = await client.query(`SELECT * FROM users JOIN renter ON users.user_id = renter.user_id where users.user_id = ${uid};`)
        }

        if(doc.rows.length == 0)
        {
            res.status(400).json({
                status: "Failed",
                message: "No records Founds!",
            })
        }else{
            res.status(200).json({
                status: "Success",
                message: "Data Found successfully!",
                data : doc.rows
            })
        }
    }
    catch(ex)
    {
        console.log(ex.message);
            res.status(400).json({
                status: "Failed",
                message: ex.message
            })
    }
}

