
import express from 'express';
import bodyParser from 'body-parser';

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
        return "it's Weekend 🫠 , hope you have a relaxing day ☕!"
    }else {
        return "it's Weekday, let's work hard today too 💪!"
    }
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    // show all today's list items on the home page
    
    res.render("index.ejs",{
        listOfToday:today,
        week : getWeek(),
        dateTime : getDateTime(),
        currentList:"today",
        currentYear : getYear()
        
    });
    
});

app.get("/work", (req,res) => {
    res.render('work.ejs',{
        listOfWork :work,
        currentList:"work",
        dateTime : getDateTime(),
        currentYear : getYear()
        
    });
});

app.post("/add",(req, res) => {
    let list = req.query.list;
    if ( list === "today") {
        today.push(req.body.newTask);
        res.redirect("/");
    }else if ( list==="work") {
        work.push(req.body.newTask);
        res.redirect("/work");
    }
}); 



app.listen(port,()=>{ 
    console.log(`Listening on port ${port}`);
});

