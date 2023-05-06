var SignUpController = require('../Controllers/SignUpController')
var PaymentDetails = require('../Controllers/PaymentDetails')
var PropertyController = require('../Controllers/PropertyController')


var express = require('express')
var path = require('path')
var cors = require('cors');

var router = express.Router()

const publicDir = path.join(__dirname, '../Public')
router.use(express.static(publicDir))

router.use(cors())


router.get('/', (req, res)=> {
    // res.send(publicDir)
    res.sendFile(publicDir + "/loginPage.html");
})

// router.get('/check', SignUpController.checkRequest)


router.get('/checkLoginDetails/:email/:pass/:type', SignUpController.checkLoginDetails)

router.post('/userSignUp', SignUpController.userSignUp)

router.get('/getUserDetails/:uid/:utype', SignUpController.getUserDetails)




router.post('/addProperty', PropertyController.addPropertyDetails)

router.get('/getAllProperties', PropertyController.getAllProperties)

router.post('/getFilteredProperty', PropertyController.getFilteredProperty)

router.delete('/deleteProperty/:prop_id/:prop_type', PropertyController.deleteProperty)



router.get('/getCreditCard/:uid', PaymentDetails.getCreditCardDetails)

router.post('/addCreditCard', PaymentDetails.addCreditCard)

router.post('/addToCart', PaymentDetails.bookingCart)

router.get('/getBookings/:user_id', PaymentDetails.getBookings)

router.delete('/deleteCard/:card_num', PaymentDetails.deleteCard)

router.get('/CardDetails/:card_num', PaymentDetails.getCardfullDetails)

router.put('/modifyCard/:card_num', PaymentDetails.modifyCard)

module.exports = router;