const {Client} = require("pg")
const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')
const { data } = require("jquery")
const e = require("express")
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



exports.getCreditCardDetails = async (req, res) => {

    var uid = req.params.uid;
    try
    {
        var doc = await client.query(`select * from credit_card_info where user_id = ${uid}`)
        res.status(200).json({
            status: "Success",
            message: "Data Extracted successfully!",
            data: doc.rows
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

exports.addCreditCard = async (req, res) => {
    
    
    var baddress_id = null;
    var data = req.body;
    try
    {
        var doc = await client.query(`select max(baddress_id) from billing_address`);
        // console.log(doc.rows[0].max);

        if(doc.rows[0].max == null)
        {
            baddress_id = 101;
        }else{
            baddress_id = doc.rows[0].max + 1
        }
    
        var add_doc = await client.query(`insert into billing_address values (${baddress_id}, '${data.line1}', '${data.line2}', '${data.city}', '${data.state}', '${data.country}', '${data.zipcode}');`);

        var card_doc = await client.query(`insert into credit_card_info values ('${data.cc_number}', '${data.exp_date}', '${data.cvv}', '${data.cc_name}', ${data.user_id}, ${baddress_id});`)

        res.status(200).json({
            status: "Success",
            message: "Data Inserted successfully!",
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

exports.bookingCart = async (req, res) => {

    var data = req.body;
    try
    {
        var doc = await client.query(`select max(booking_id) from bookings`);

        if(doc.rows[0].max == null)
        {
            b_id = 5001;
        }else{
            b_id = doc.rows[0].max + 1
        }
    
        
        var cart_doc = await client.query(`insert into bookings values (${b_id}, '${data.start_date}', '${data.end_date}', ${data.rental_period}, '${data.cc_num}', ${data.prop_id}, '${data.prop_type}', '${data.prop_address}', ${data.user_id});`)

        res.status(200).json({
            status: "Success",
            message: "Added to cart successfully!",
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


exports.deleteCard = async (req, res) => {
    
    var card_num = req.params.card_num;
    try
    {
        var del_card_doc = await client.query(`DELETE FROM credit_card_info WHERE credit_card_number = '${card_num}';`)
        
        res.status(200).json({
            status: "Success",
            message: "Card deleted successfully!",
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

exports.modifyCard = async (req, res) => {
    
    var card_num = req.params.card_num;
    var data = req.body;
    try
    {
        var del_card_doc = await client.query(`
        update billing_address
        set line1 = '${data.line1}', line2 = '${data.line2}', city = '${data.city}', state = '${data.state}', country = '${data.country}', zipcode = '${data.zipcode}'
        where baddress_id = (select baddress_id from credit_card_info where credit_card_number = '${card_num}')`)
        
        res.status(200).json({
            status: "Success",
            message: "Card Updated successfully!",
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


exports.getCardfullDetails = async (req, res) => {

    var card_num = req.params.card_num;
    try
    {
        var doc = await client.query(`
        select * from credit_card_info
        JOIN billing_address ON credit_card_info.baddress_id = billing_address.baddress_id
        where credit_card_info.credit_card_number = '${card_num}'`)


        res.status(200).json({
            status: "Success",
            message: "Data Extracted successfully!",
            data: doc.rows
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


exports.getBookings = async (req, res) => {
    
    var user_id = req.params.user_id;
    try
    {
        var book_doc = await client.query(`select * from bookings where user_id = ${user_id} `)
        
        res.status(200).json({
            status: "Success",
            message: "Data Extracted successfully!",
            data: book_doc.rows
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
