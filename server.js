var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var axios = require("axios");
var cheerio = require("cheerio");


var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();


app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";


mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
});



app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public/Index.html"));
});


app.get("/saved", function (req, res) {
    res.sendFile(path.join(__dirname, "public/Saved.html"));
});


app.get("/scrape", function (req, res) {

    axios.get("https://www.npr.org/sections/news/").then(function (response) {

        var $ = cheerio.load(response.data);
        let counter = 0;

        $("article").each(function (i, element) {
            var result = {};
            var storyDiv = $(this).children("div.story-body")
            result.url = storyDiv.children("a").attr("href")
            var metaDiv = storyDiv.children("a").children("div.story-meta")
            result.headline = metaDiv.children("h2").text()
            result.summary = metaDiv.children("p.summary").text();


            if (result.headline && result.url) {
                db.Article.create(result)
                    .then(function (dbArticle) {
                        console.log(dbArticle);
                        counter++;
                        console.log("added " + counter + " new items")
                    })
                    .catch(function (err) {
                        return res.json(err);
                    });
                console.log(result)

            }


        });


        res.sendFile(path.join(__dirname, "public/index.html"));

    });
});


app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});


app.get("/articles/:id", function (req, res) {
    db.Article.findOne({
            _id: req.params.id
        })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});



app.put("/articles/:id", function (req, res) {
    db.Article.update({
            _id: req.params.id
        }, {
            $set: {
                isSaved: true
            }
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {

        });
});





app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                note: dbNote._id
            }, {
                new: true
            });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});




// route for deleting an article
app.delete("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that updates the matching one in our db...
    db.Article.remove({
            _id: req.params.id
        })

        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});


// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});