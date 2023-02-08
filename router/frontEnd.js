const express = require("express");
const paypal = require("paypal-rest-sdk");
const paymentSchema = require("../model/paymentSchema");
var Publishable_Key = "pk_test_F5UFRy9rcym7iLRTtaH55jGu";
const stripe = require("stripe")("sk_test_Czcmd6nNU3pu0sUjKGT3TYAf");
const { authorizePay } = require("../middleware/validator");

require("dotenv").config();

const Router = express.Router();
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.client_id,
  client_secret: process.env.client_secret,
});
var amountr = 0;
Router.get("/", (req, res) => {
  res.render("index", { title: "Sign Up" });
});
Router.get("/register", (req, res) => {
  res.render("register", { title: "register" });
});
Router.get("/list", (req, res) => {
  res.render("studentList", {
    title: "Student List",
    key: Publishable_Key,
    amount: req.body.amount * 100,
    description: "stripe",
  });
  // res.redirect("/api/student/getalldata");
});
Router.get("/dasboard", async (req, res) => {
  res.render("dasboard", { title: "Dasboard" });
});

// paypal
Router.get("/payment", (req, res) => res.render("payment"));
Router.post("/pay", (req, res) => {
  const { username, amount } = req.body;
  if (req.body.stripeToken) {
    stripe.customers
      .create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
      })
      .then((customer) => {
        return stripe.charges.create({
          amount: req.body.amount * 100,
          description: req.body.description,
          currency: "INR",
          customer: customer.id,
        });
      })
      .then(async (charge) => {
        await paymentSchema.create({
          username: username,
          currency: "USD",
          amount: charge.amount,
          payment_id: charge.id,
          paymentMethod: "stripe",
        });
        res.redirect("/list");
      })
      .catch((err) => {
        res.send("Invalid Card number");
        console.log(err);
      });
  }
  if (req.body.pay) {
    authorizePay(req, res);
  } else {
    amountr = amount;
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:4000/success1",
        cancel_url: "http://localhost:4000/cancel",
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: username,
                sku: "001",
                price: amount,
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: amount,
          },
          description: "payment integration",
        },
      ],
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
  }
});

Router.get("/success1", async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: amountr,
        },
      },
    ],
  };

  // Obtains the transaction details from paypal
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    async function (error, payment) {
      //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        // console.log(JSON.stringify(payment));
        await paymentSchema.create({
          username: payment.transactions[0].item_list.items[0].name,
          currency: payment.transactions[0].item_list.items[0].currency,
          amount: payment.transactions[0].item_list.items[0].price,
          payment_id: payment.id,
          paymentMethod: "paypal",
        });
        res.redirect("/list");
      }
    }
  );
});
Router.get("/cancel", (req, res) => res.redirect("/list"));

Router.get("/paymentlist", async (req, res) => {
  var result = await paymentSchema.find();
  res.render("paymentlist", { title: "Dasboard",result });
});
module.exports = Router;
