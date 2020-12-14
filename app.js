const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema = {
  name:String
}

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({name:"Eat food"});
const item2 = new Item({name:"Drink Water"});
const item3 = new Item({name:"Go to bed"});

const basicItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemsSchema]
}

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {
  Item.find({},function(err,results){
    if(err){
      console.log(err);
    }else if(results.length === 0){
      Item.insertMany(basicItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully added items");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: results});
    }
  });
});

app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items:basicItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({name:itemName});
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  
});

app.post("/delete",function(req,res){
  const idValue = req.body.check;
  Item.deleteOne({_id:idValue},function(err){
    if(!err){
      console.log("successfully deleted");
      res.redirect("/");
    }
  });
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
