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

app.get("/search/:location", function (req,res){
    yelp.search({
        term: 'bars',
        location: req.params.location
    })
    .then(function(data) {
        res.render("search.ejs",data);
    })
    .catch(function(err) {
        console.error(err);
    });
})




app.listen(port, function(err) {
    if (err) throw err;
    console.log("Listening on " + port);

})
