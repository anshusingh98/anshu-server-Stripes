const express = require("express");
var mongoose = require("mongoose");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
const bodyParser = require("body-parser");
const cors = require("cors");
const customer = require("./Customer");

mongoose.connect('mongodb://127.0.0.1:27017/product', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
}).then(()=>{
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
  


app.post('/create-checkout-session', async (req, res) => {
  console.log(req.body);
  const session = await stripe.checkout.sessions.create({
    
    line_items: [
      {
        price_data: {
          currency: 'inr',
          product_data: { 
            name: req.body.product_name,
          },
          unit_amount: req.body.price*100,
        },
        quantity: req.body.quantity,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/failed',
  });
console.log(session.status);
  res.send({id: session.id});
});


app.post('/webhook',async(req,res)=>{
  const payload = req.body;

  const payloadString = JSON.stringify(payload,null,2);
  const header = stripe.webhooks.generateTestHeaderString({
    payload : payloadString,
    secret: process.env.WEBHOOK_SIGNING_SECRET_KEY,
  });
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payloadString,
      header,
      process.env.WEBHOOK_SIGNING_SECRET_KEY
    );
    console.log("webhook verified");
  } catch (error) {
    console.log("webhook signature verification failed",error.message);
    return res.sendStatus(400);
  }
  console.log(event);
  if(event.type === "charge.succeeded"){
    let Customer = {
      name: event.data.object.billing_details.name,
      email:  event.data.object.billing_details.email,
      country: event.data.object.billing_details.address.country,
      amount: event.data.object.amount_captured
    }
    
    console.log("customer",customer);
    let newCustomer = customer(Customer);
    await newCustomer.save((error, customer)=>{
      if(error)console.log(error);
    
    });
  }

 
})

app.listen(process.env.PORT || 8080, () => {
  console.log("Server started...");
})
}).catch(err=>console.log(err))










