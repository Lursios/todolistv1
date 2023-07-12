const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
const port = 3000;

// App that's going to be used --Opening
// app.use(express.static("public")); 
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

//Go live & Set up Database 
mongoose.connect("mongodb://127.0.0.1:27017/toDolistProject");

const taskSchema = mongoose.Schema({
    activity : String,
    time : Number,
    priority : String,
    notes : String,
    working : Boolean,
    pomoCountActual : Number
});

const timerSchema = mongoose.Schema({
    pomoFocusTime : String,
    shortbreakTime : Number,
    longBreakTime : String,
    notes : String
});

const listsSchema = mongoose.Schema({
    listName : String,
    activity : [taskSchema]
});

const tasks = mongoose.model("tasks",taskSchema);
const timer = mongoose.model("timer", timerSchema);
const lists = mongoose.model("lists",listsSchema);


const howToDelete = new tasks({
    activity: "<-- Click Here to Delete a task",
    priority: "urgent-important"
});

const howToAdd = new tasks({
    activity: "Type below to add new item !",
    priority : "urgent-important"
});

const defaultTask = [howToDelete,howToAdd];

// Add default value if database hasn't existed yet
tasks.find().then(async function(task){
    if (task.length === 0) {
        tasks.insertMany(defaultTask).then((insertedTask,err)=>{
            if (err) {
                console.log(err);
            } else {
                console.log("Default Items has been sucessfully added");
            };
        });
    };
});


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

    tasks.find().then(async function(task,err){
        if (err){
            console.log(err);
        } else {
            res.render("list", {listTitle:"Today", typeOfDay,items:task});
        };
    });
});
        
// Routing for other lists            
app.get("/:userList", async (req, res)=> {    
    const customListName = _.capitalize(req.params.userList);
    const currentList = await lists.findOne({listName: customListName});

    if (!currentList) {
        const list = new lists({
            listName : customListName,
            activity : defaultTask  
        });
        list.save();
        res.redirect(`/${list.listName}`)
    } else {
        res.render("list",{listTitle:currentList.listName, items:currentList.activity})
    };
});


// get requests -- Closing

// post requests -- Opening
app.post("/", function(req, res) {
    const newItem = new tasks({
        activity : req.body.itemName,
        priority : "urgent-important"
    });

    const listName = req.body.list; 
    //adding it to the database this is dynamic routing so also
    if (_.lowerCase(listName) === "today" ) {
        newItem.save();
        res.redirect("/");
    } else {
        lists.findOne({listName :listName}).then((foundList, err)=> { // find & return the list 
        foundList.activity.push(newItem); // it will save newly created task and append it to the array of tasked for the current list
        foundList.save(); // this will save it 
        res.redirect(`/${listName}`); // this will redirect it to the correct route
        });
    };

});

app.post("/delete", function(req, res){
    const removeTask = req.body.check;
    const listName = req.body.listName;

    tasks.findByIdAndRemove(removeTask).then((task,err) => {
        if (_.lowerCase(listName) === "today" ) {
            if (!err) {
                res.redirect("/");
            } else {
                console.log(err);
            };
        } else {
            lists.findOneAndUpdate({listName : listName},{$pull:{activity:{_id:removeTask}}}).then((removedList,err)=>{
                res.redirect(`/${listName}`);
            });
        };
        
    });
});

// Post requests -- Closing

app.listen(port,function(){
    console.log(`Listening to port ${port}`);
});

