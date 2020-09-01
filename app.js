//jshint esversion:6
const port = process.env.PORT || 3000;
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ =require("lodash");
const app = express();
const multer = require("multer");
app.set('view engine', 'ejs');
const upload = multer();
app.use(bodyParser.urlencoded({extended: true}));
app.use(upload.array());
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-gramm:admin123@cluster0.2wsrn.mongodb.net/todolistDB?retryWrites=true&w=majority/todolistDB", {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false })

const itemSchema = new mongoose.Schema({
    name: String,
})
const Item = mongoose.model("item", itemSchema);

const item0 = new Item({
    name: "Hello"
});
const item1 = new Item({
    name: "Use + button to add "
});
const item2 = new Item({
    name: "Use checkbox to delete"
})
const arrayItems = [item0, item1, item2];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {

    const day = date.getDate();
    Item.find({}, function (err, findItems) {
        if (findItems.length === 0) {
            Item.insertMany(arrayItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("all good")
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newListItems: findItems});
        }


    });
});

app.get("/:customListName", function (req, res) {
    let customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: arrayItems
                })
                list.save();
                res.redirect("/" + customListName)
            } else {
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
            }
        }
    })


});

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName,
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/")
    } else {
        List.findOne({name: listName}, function (err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" +listName)
        })
    }


});


app.post("/delete", function (req, res) {
    const checkedItemId = req.body.mybox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log("all god bruh");
                res.redirect("/")
            }

        })
    } else
    {
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function (err, foundList){
            if (!err){
                res.redirect("/" + listName)
            }
        })
    }


});

app.listen(port, function () {
    console.log("Server started on port 3000");
});
