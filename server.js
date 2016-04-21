var express = require("express"),
    app = express(),
    session = require("express-session"),
    dbUrl = process.env.MONGODB_URI,
    mongoose = require("mongoose"),
    MongoStore = require("connect-mongo")(session),
    port = process.env.PORT,
    yelpAuth = require("./config/yelpAuth.js"),
    passport = require("passport"),
    Yelp = require("yelp");

//VIEWS
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");


var yelp = new Yelp({
    consumer_key: yelpAuth.consumer_key,
    consumer_secret: yelpAuth.consumer_secret,
    token: yelpAuth.token,
    token_secret: yelpAuth.token_secret,
});

app.get("/search", function (req,res){
    yelp.search({
        term: 'bars',
        location: req.query.location
    })
    .then(function(data) {
        res.render("searchResults.ejs",data);
    })
    .catch(function(err) {
        console.log(err);
    });
})


app.get("/checkin", function(req,res){
    
})

app.get("/checkout", function (req,res){
    
})



app.listen(port, function(err) {
    if (err) throw err;
    console.log("Listening on " + port);

})
