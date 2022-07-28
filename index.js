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
  



app.get("/Product", (req, res)=>{
  product.find((error, product)=>{
    if(error)res.send(400).json(error);

    res.status(200).json(product);

  })
});


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
    success_url: 'http://localhost:3000/stripepaymentsuccess',
    cancel_url: 'http://localhost:3000/stripepaymentcancel',
  });

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










// app.post("/stripe/charge", cors(), async (req, res) => {
//   console.log("stripe-routes.js 9 | route reached", req.body);
//   let { amount, id } = req.body;
//   console.log("stripe-routes.js 10 | amount and id", amount, id);
//   try {
//     const payment = await stripe.paymentIntents.create({
//       amount: amount,
//       currency: "USD",
//       description: "Your Company Description",
//       payment_method: id,
//       confirm: true,
//     });
//     console.log("stripe-routes.js 19 | payment", payment);
//     res.json({
//       message: "Payment Successful",
//       success: true,
//     });
//   } catch (error) {
//     console.log("stripe-routes.js 17 | error", error);
//     res.json({
//       message: "Payment Failed",
//       success: false,
//     });
//   }
// });