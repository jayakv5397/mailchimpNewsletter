const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const ejs = require("ejs");
const dotenv = require('dotenv').config();


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});


app.post("/", async function (req, res) {

  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };
  const jsonData = JSON.stringify(data);
  const url = "https://us21.api.mailchimp.com/3.0/lists/" + process.env.LIST;

  const config = {
    headers: { Authorization: process.env.API_KEY },
  };

  try {
    const result = await axios.post(url , jsonData, config);
    const err = result.data.errors[0];
    console.log(err);

    if(err===undefined){
      res.render("failure.ejs", {
        message: "Successfully subscibed",
      });
    }else {
      if(err.error_code==="ERROR_CONTACT_EXISTS"){
        res.render("failure.ejs", {
          message: "You are already subscribed",
        });
      } else{
        res.render("failure.ejs", {
          message: err.error_code,
        });
      }
    }
     

  } catch (error) {
    console.log(error)
    if(error.data.status === 403){
      res.render("failure.ejs", {
        message: "There is some issue, please contact admin",
      });
    }
    
  }


});


app.post("/failure", function (req, res) {
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running");
});
