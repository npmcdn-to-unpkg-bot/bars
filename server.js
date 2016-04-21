var express = require("express"),
    app = express(),
    dbUrl = process.env.MONGODB_URI,
    port = process.env.PORT,
    yelpAuth = require("./config/yelpAuth.js"),
    Yelp = require("yelp");



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
        console.log(data);
        
    })
    .catch(function(err) {
        console.error(err);
    });
})




app.listen(port, function(err) {
    if (err) throw err;
    console.log("Listening on " + port);

})
