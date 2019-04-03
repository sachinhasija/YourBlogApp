var bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    express = require("express"),
    app = express(),
    methodOverride = require("method-override"),
    sanitizer = require("express-sanitizer");


//APP/MONGOOSE CONFIG
mongoose.connect("mongodb://localhost:27017/blog_app", { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(sanitizer());
mongoose.set('useFindAndModify', false);

//MONGOOSE MODEL CONFIG
var blogSchema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
});

var Blog = new mongoose.model("Blog", blogSchema);


//ROUTES
app.get("/", function (req, res) {
    res.redirect("/blogs");
});

//INDEX ROUTE   
app.get("/blogs", function (req, res) {
    Blog.find({}, function (err, blog) {
        if (err) {
            console.log("Error", err);
        }
        else {
            res.render("index", { blogs: blog });
        }
    });
});

//NEW ROUTE
app.get("/blogs/new", function (req, res) {
    res.render("new");
});

//CREATE NEW BLOG
app.post("/blogs", function (req, res) {
    req.body.blogs.body = req.sanitize(req.body.blogs.body);
    var title = req.body.blogs.title,
        body = req.body.blogs.body,
        image = req.body.blogs.image,
        newBlog = {
            title: title,
            body: body,
            image: image
        };

    Blog.create(newBlog, function (err, blog) {
        if (err) {
            console.log("Error", err);
        }
        else {
            console.log("Blog Added!");
            res.redirect("/blogs");
        }
    })
});

//SHOW EACH BLOG

app.get("/blogs/:id", function (req, res) {
    Blog.findById(req.params.id, function (err, blog) {
        if (err) {
            console.log("error", err);
        }
        else {
            res.render("show", { blog: blog });
        }
    })
});


app.get("/blogs/:id/edit", function (req, res) {
    Blog.findById(req.params.id, function (err, blog) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.render("edit", {
                blogs: blog
            });
        }
    });

});


app.put("/blogs/:id", function (req, res) {
    req.body.blogs.body = req.sanitize(req.body.blogs.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blogs, function (err, updatedBlog) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});



app.delete("/blogs/:id", function (req, res) {
    Blog.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/blogs/");
        }
        else {
            res.redirect("/blogs");
        }
    });
});


app.listen(process.env.PORT, process.env.IP, function () {
    console.log("Blog App Server is Running !!");
});
