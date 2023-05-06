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


exports.deleteProperty = async (req, res) => {
    var prop_id = req.params.prop_id;
    var prop_type = req.params.prop_type;
    try
    {
        if(prop_type == "House")
        {
            var del_hou = await client.query(`delete from house where property_id = ${prop_id};`)

        }else if (prop_type == "Apartment")
        {
            var del_aprt = await client.query(`delete from apartment where property_id = ${prop_id};`)
        }else
        {
            var del_comm = await client.query(`delete from commercial_building where property_id = ${prop_id};`)
        }

        var prop_doc = await client.query(`delete from property where property_id = ${prop_id};`)

        res.status(200).json({
            status: "Success",
            message: "Property deleted successfully!",
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

exports.addPropertyDetails = async (req, res) => {

    var data = req.body;
    try
    {
        var prop_doc = await client.query(`select max(property_id) from property;`);

        if(prop_doc.rows[0].max == null)
        {
            property_id = 1001;
        }else{
            property_id = prop_doc.rows[0].max + 1
        }
        // console.log(property_id);

        
        var add_doc = await client.query(`select max(address_id) from address;`);

        if(add_doc.rows[0].max == null)
        {
            address_id = 101;
            var address = await client.query(`insert into address values (${address_id}, ${data.unit_no}, ${data.street_no}, '${data.street_name}', '${data.city}', '${data.state}', '${data.zipcode}');`);

        }else{

            var add_exist_doc = await client.query(`
                                            select * from address where 
                                            unit_number = ${data.unit_no} and 
                                            street_number = ${data.street_no} and
                                            street_name = '${data.street_name}' and
                                            city = '${data.city}' and
                                            country = '${data.state}' and
                                            zipcode = '${data.zipcode}'
                                            `);
            // console.log(add_exist_doc.rows)

            if(add_exist_doc.rows.length > 0)
            {
                address_id = add_exist_doc.rows[0].address_id
            }else
            {
                address_id = add_doc.rows[0].max + 1
                var address = await client.query(`insert into address values (${address_id}, ${data.unit_no}, ${data.street_no}, '${data.street_name}', '${data.city}', '${data.state}', '${data.zipcode}');`);

            }

            // console.log(address_id)
        }



        var property_doc = await client.query(`insert into property values (${property_id}, '${data.prop_type}', '${data.description}', '${data.a_date}', ${address_id}, '${data.prop_list_type}', ${data.rent_price}, ${data.sale_price});`)

        if(data.prop_type == "House")
        {
            var hou_doc = await client.query(`insert into house values (${property_id}, ${data.bathroom_no}, ${data.bedroom_no}, ${data.parking}, ${data.carp_area}, ${property_id});`)

        }else if (data.prop_type == "Apartment")
        {
            var apt_doc = await client.query(`insert into apartment values (${property_id}, '${data.build_type}', ${data.bedroom_no}, ${data.bathroom_no}, ${data.laundry}, ${data.carp_area}, ${property_id});`)
        }else
        {
            var comm_doc = await client.query(`insert into commercial_building values (${property_id}, ${data.camera_no}, '${data.bussi_type}', ${data.fire_alarm}, ${data.burglar_alarm}, ${property_id});`);
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

exports.getAllProperties = async (req, res) => {
    
    try
    {
        var doc = await client.query(`
                SELECT *
                FROM property
                LEFT JOIN house ON property.property_id = house.property_id
                LEFT JOIN apartment ON property.property_id = apartment.property_id
                LEFT JOIN commercial_building ON property.property_id = commercial_building.property_id
                LEFT JOIN address ON property.address_id = address.address_id`)

        res.status(200).json({
            status: "Success",
            message: "Data Extracted successfully!",
            count : doc.rows.length,
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

exports.getFilteredProperty = async (req, res) => {

    var data = req.body;
    console.log(data)
    var querylst = [];
    try
    {
        var str = `
        SELECT *
        FROM property
        LEFT JOIN house ON property.property_id = house.property_id
        LEFT JOIN apartment ON property.property_id = apartment.property_id
        LEFT JOIN commercial_building ON property.property_id = commercial_building.property_id
        LEFT JOIN address ON property.address_id = address.address_id`

        if(data.prop_id != null)
        {
            str = str + ` WHERE property.property_id = ${data.prop_id}`
            console.log(str)
        }
        else
        {
            if(data.prop_type != null || data.ava_date != null || data.prop_list_type != null || data.location != null || data.min_budget != null || data.max_budget != null )
            {
                str = str + " WHERE ";

                if(data.prop_type != null)
                {
                    querylst.push(`property.property_type = '${data.prop_type}' `)
                }

                if(data.ava_date != null)
                {
                    querylst.push(`availability_date <= '${data.ava_date}' `)
                }

                if(data.prop_list_type != null)
                {
                    querylst.push(`property_listing_type = '${data.prop_list_type}' `)
                }

                if(data.location != null)
                {
                    querylst.push(`city = '${data.location}' `)
                }
                
                if(data.prop_list_type == "rent")
                {
                    if(data.min_budget != null && data.max_budget != null)
                    {
                        querylst.push(`rental_price BETWEEN ${data.min_budget} AND ${data.max_budget} `)
                    }
                }else if(data.prop_list_type == "sale")
                {
                    if(data.min_budget != null && data.max_budget != null)
                    {
                        querylst.push(`sale_price BETWEEN ${data.min_budget} AND ${data.max_budget} `)
                    }
                }else if(data.prop_list_type == "both")
                {
                    if(data.min_budget != null && data.max_budget != null)
                    {
                        querylst.push(`rental_price BETWEEN ${data.min_budget} AND ${data.max_budget} or sale_price BETWEEN ${data.min_budget} AND ${data.max_budget} `)
                    }
                }

            }
            var constr = "";
            for(var item of querylst)
            {
                constr = constr + item + "AND ";
            }

            constr = constr.substring(0, constr.length-5)
            str = str + constr;
        }

        // console.log(str)

        var filter_doc = await client.query(str);

        res.status(200).json({
            status: "Success",
            message: "Data Extracted successfully!",
            count : filter_doc.rows.length,
            data : filter_doc.rows
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

