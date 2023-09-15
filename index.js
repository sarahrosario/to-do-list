
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose'

// start our server at port 3000
const app = express();
const port = 3000;

const today = [];
const work = [];
const date = new Date();

function getYear() {
    return date.getFullYear();
}

function getDateTime(){
    return date.toDateString();
}

function getWeek () {
    const day = date.getDay();
    if (day === 0 || day === 6) {
        return "Yeah! it's Weekend 🫠 , have a relaxing day ☕!"
    }else {
        return "It's Weekday, let's work hard today too 💪!"
    }
}

function capitalize(str) {
	const lower = str.toLowerCase()
	return str.charAt(0).toUpperCase() + lower.slice(1)
}

// -----------------------      todolist  DB          ------------------------------------------
// connect to mongoDB
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
}

//--------------------       item  collection      ---------------------
// define item schema
const itemSchema = new mongoose.Schema({
    name : String
});
// create item model
const Item = new mongoose.model('Item', itemSchema);
// create default documents but not save yet until first time load home page
const item1 = new Item ({name : 'Welcome to your ToDoList!' });
const item2 = new Item ({name : "Hit the 'Add' button to add a new item."});
const item3 = new Item ({name : "<-- Hit this to delete an item."})
const defaultItems = [item1, item2, item3];
// keep track if welcome texts has been added before 
let defaultItemAdd = false;

//--------------------       List  collection    ----------------------------
// define list schema
const listSchema = new mongoose.Schema({
    name : String,
    items : [itemSchema]
});
// create list model
const List = new mongoose.model('List', listSchema);
// add new list ducument


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// home page route
app.get("/", async(req, res) => {
    try{
        const customLists = await List.find();
        const items = await Item.find({});
        // only show default text when db is empty, avoid duplicating every time loads the page
        // if DB is not empty, then render what's already inside, no inserting default text
        if (items.length === 0 && defaultItemAdd === false) {
            // insert documents to DB
            
            await Item.insertMany(defaultItems);
            defaultItemAdd = true;
            res.redirect("/");
            // if db is not empty, render the home page
        }else {
            res.render("index.ejs",{
                customLists : customLists,
                listItems:items,
                week : getWeek(),
                dateTime : getDateTime(),
                listTitle: "Today" ,
                currentYear : getYear()
                
            });
        }
    }catch(err){
        console.log(err);
    }
    
    
});

// route to create new list 
app.get("/customize", async(req,res) => {
    try{
        const customLists = await List.find();
        console.log(customLists)
        res.render('customize.ejs', {
            customLists : customLists,
            currentYear : getYear()
        });
    }catch(err){
        console.log(err)
    }
    
});

// route to custom list 
app.get('/:customListName', async(req,res)=> {
    const customLists = await List.find();
    // get list name
    const listName = await req.params.customListName;
    console.log(listName)
    if (listName !=="favicon.ico"){
        try{
        // find list by name
        const foundList= await List.findOne({ name: listName});
        console.log(foundList.items);
        res.render("index.ejs",{
                    customLists : customLists,
                    listItems:foundList.items,
                    week : getWeek(),
                    dateTime : getDateTime(),
                    listTitle: foundList.name ,
                    currentYear : getYear()
                });
        }catch(err) {
            console.log(err)
        }

    }else{
        res.redirect("/");
    }
    
    
});

// route to add item
app.post("/add", async(req, res) => {
    try{
        // indentify which list to be added
        console.log(req.body);
        const listName = req.body.list;
        const newItem = new Item ({name : req.body.newTask});
    
        if ( listName === "Today") {
            await newItem.save()
            res.redirect("/");
        }else {
            const foundList = await List.findOne({ name: listName});
            foundList.items.push(newItem);
            await foundList.save();
            res.redirect(`/${listName}`);
        }
    }catch(err){
        console.log(err)
    }
    
}); 

// route to cretae new list 
app.post('/addlist', async(req,res) => {
    console.log(req.body)
    const listName = capitalize(req.body.listName);
    console.log(listName)
    const foundList = await List.findOne({ name: listName});
    if (!foundList) {
        console.log ('list not exist ' )
        // create new list
        const customList = new List ({
        name : listName,
        items : defaultItems
        })
        await customList.save();
    }else {
        console.log('list exists, name is '+ foundList.name);
    }
    res.redirect(`/${listName}`);
   
})

// route to delete item
app.post("/delete", async(req,res) => {
    try{
        // indentify which list item to delete
        console.log(req.body);
        const checkItemId = req.body.checkbox;
        const listName = req.body.list;
        // delete item by id in DB
        if (listName === "Today") {
            await Item.deleteOne({_id : checkItemId});
            res.redirect("/");
        }else {
            await List.findOneAndUpdate(
                { name: listName}, 
                {$pull: {items: {_id : checkItemId }}});
            res.redirect(`/${listName}`);
        }
    
    }catch(err){
        console.log(err);
    }
    
});


app.post("/deletelist", async(req,res) => {
    try{
        console.log(req.body);
        const listName = req.body.list;
        await List.deleteOne({name : listName});
        res.redirect("/");

    }catch(err){
        console.log(err);
    }
    
})

app.listen(port,()=>{ 
    console.log(`Listening on port ${port}`);
});

