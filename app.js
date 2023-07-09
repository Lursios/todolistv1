const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;
var items = ["Going to gym", "finish course for website"];
let workItems = [];
// App that's going to be used --Opening
// app.use(express.static("public")); 
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

// App that's going to be used --Closing
// get requests --Opening
app.get("/", function(req, res ){
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const options = { weekday: "long", year: 'numeric', month: 'long', day: 'numeric'  };
    var typeOfDay = "";
    const day = (new Intl.DateTimeFormat("en-US", options).format(currentDate));

    if (currentDay === 6 || currentDay === 0 ) {
        typeOfDay = "it's the weekend !";
    } else {
        typeOfDay = "it's the weekdays !";
    }; 
    // res.sendFile(__dirname+"/index.html");
    // res.render("list2", {day:day , typeOfDay:typeOfDay,items:items});
    res.render("list", {listTitle:day, typeOfDay,items:items});
});

app.get("/work", function(req, res) {
    res.render("list",{listTitle:"Work List", items: workItems});
});
// get requests -- Closing

// post requests -- Opening
app.post("/", function(req, res) {
    var newItem = req.body.itemName;
    items.push(newItem);
    res.redirect("/");
});

app.post("/work", function(req, res) {
    workItems.push(req.body.itemName);
    res.redirect("/work");
})

app.listen(port,function(){
    console.log(`Listening to port ${port}`);
});

