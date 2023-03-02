var express = require("express")
var bodyParser = require("body-parser")
var fs = require('fs')

//creating the app
var app = express();
app.use(bodyParser.urlencoded({
    extended:true
}));

//view engine setup
app.set('view engine', 'ejs')
//setting a folder 
const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

//database sqlite3
const Database = require('better-sqlite3')
const db = new Database('./db/DATABASE.sqlite3')


//get method
app.get("/", function(req, res) {
  res.render('template', {
    pictures: false,
    results: false
  });
});

//post method
app.post("/", function(req, res) {

  //category
  var category = Number(req.body.category);
  if(category==-1){
    category = null
  }

  //keywords
  var keywordsall = String(req.body.keywords);
  if(keywordsall == ""){
    keywords = null
  }else{
    var keywords = keywordsall.split(" ")
  }
  
  //condition
  var condition = String(req.body.condition);
  if(condition == "undefined" ){
    condition = "atleastone"
  }

  //emotions
  var emo_group = String(req.body.emo_group);
  if(emo_group == "undefined"){
    emo_group = "emo_all"
  }

  //dimensional emotions
  //valence
  var val_mean_before = Number(req.body.val_mean_before)
  var val_mean_after = Number(req.body.val_mean_after)
  var val_sd_before = Number(req.body.val_sd_before)
  var val_sd_after = Number(req.body.val_sd_after)
  //valence
  var aro_mean_before = Number(req.body.aro_mean_before)
  var aro_mean_after = Number(req.body.aro_mean_after)
  var aro_sd_before = Number(req.body.aro_sd_before)
  var aro_sd_after = Number(req.body.aro_sd_after)

  //basic emotions
  //anger
  var anger_mean_before = Number(req.body.anger_mean_before)
  var anger_mean_after = Number(req.body.anger_mean_after)
  var anger_sd_before = Number(req.body.anger_sd_before)
  var anger_sd_after = Number(req.body.anger_sd_after)
  //surprise
  var surprise_mean_before = Number(req.body.surprise_mean_before)
  var surprise_mean_after = Number(req.body.surprise_mean_after)
  var surprise_sd_before = Number(req.body.surprise_sd_before)
  var surprise_sd_after = Number(req.body.surprise_sd_after)
  //joy
  var joy_mean_before = Number(req.body.joy_mean_before)
  var joy_mean_after = Number(req.body.joy_mean_after)
  var joy_sd_before = Number(req.body.joy_sd_before)
  var joy_sd_after = Number(req.body.joy_sd_after)
  //disgust
  var disgust_mean_before = Number(req.body.disgust_mean_before)
  var disgust_mean_after = Number(req.body.disgust_mean_after)
  var disgust_sd_before = Number(req.body.disgust_sd_before)
  var disgust_sd_after = Number(req.body.disgust_sd_after)
  //sadness
  var sadness_mean_before = Number(req.body.sadness_mean_before)
  var sadness_mean_after = Number(req.body.sadness_mean_after)
  var sadness_sd_before = Number(req.body.sadness_sd_before)
  var sadness_sd_after = Number(req.body.sadness_sd_after)
  //fear
  var fear_mean_before = Number(req.body.fear_mean_before)
  var fear_mean_after = Number(req.body.fear_mean_after)
  var fear_sd_before = Number(req.body.fear_sd_before)
  var fear_sd_after = Number(req.body.fear_sd_after)
   
  //name and number
  var number = String(req.body.number)
  if(number == ""){
    number = null
  }
  var name = String(req.body.name)
  if(name == ""){
    name = null
  }
  
  //buidling blocks for sql
  sql = ""

  //emotions 
  if(emo_group == "emo_all"){
    sql += 'SELECT * FROM Image JOIN EmotionAll JOIN Location WHERE Image.ID = EmotionAll.ImageID AND Location.ID = Image.ID AND '
  }else if(emo_group == "emo_women"){
    sql += 'SELECT * FROM Image JOIN EmotionWomen JOIN Location WHERE Image.ID = EmotionWomen.ImageID AND Location.ID = Image.ID AND '
  }else if(emo_group == "emo_men"){
    sql += 'SELECT * FROM Image JOIN EmotionMen JOIN Location WHERE Image.ID = EmotionMen.ImageID AND Location.ID = Image.ID AND '
  }

  //category
  if(category != null){
    sql += 'ImageCategoryID = ' + category + ' AND '
  }

  //keywords
  if(keywords != null){
    if(condition == "atleastone"){
      if(keywords.length != 0){
        sql += '('
      }
      for (var i = 0; i < keywords.length; i++) {
        if(i != keywords.length - 1){
          if(keywords.length != 1){
            sql += "Description LIKE '%" + keywords[i] + "%' OR "
          }
        }else{
          if(keywords.length != 0){
            sql += "Description LIKE '%" + keywords[i] + "%') AND "
          }else{
            sql += "Description LIKE '%" + keywords[i] + "%' AND "
          }
        }
      }
    }else if(condition == "allofthem"){
      for (var i = 0; i < keywords.length; i++) {
        sql += "Description LIKE '%" + keywords[i] + "%' AND "
      }
    }
  }

  //dimensional emotions
  //valence
  sql += 'ValenceM BETWEEN ' + val_mean_before + ' AND ' + val_mean_after + ' AND '
  sql += 'ValenceSD BETWEEN ' + val_sd_before + ' AND ' + val_sd_after + ' AND '
  //arousal
  sql += 'ArousalM BETWEEN ' + aro_mean_before + ' AND ' + aro_mean_after + ' AND '
  sql += 'ArousalSD BETWEEN ' + aro_sd_before + ' AND ' + aro_sd_after + ' AND '

  //basic emotions
  //joy
  sql += 'HappinessM BETWEEN ' + joy_mean_before + ' AND ' + joy_mean_after + ' AND '
  sql += 'HappinessSD BETWEEN ' + joy_sd_before + ' AND ' + joy_sd_after + ' AND '
  //fear
  sql += 'FearM BETWEEN ' + fear_mean_before + ' AND ' + fear_mean_after + ' AND '
  sql += 'FearSD BETWEEN ' + fear_sd_before + ' AND ' + fear_sd_after + ' AND '
  //sadness
  sql += 'SadnessM BETWEEN ' + sadness_mean_before + ' AND ' + sadness_mean_after + ' AND '
  sql += 'SadnessSD BETWEEN ' + sadness_sd_before + ' AND ' + sadness_sd_after + ' AND '
  //surprise
  sql += 'SurpriseM BETWEEN ' + surprise_mean_before + ' AND ' + surprise_mean_after + ' AND '
  sql += 'SurpriseSD BETWEEN ' + surprise_sd_before + ' AND ' + surprise_sd_after + ' AND '
  //disgust
  sql += 'DisgustM BETWEEN ' + disgust_mean_before + ' AND ' + disgust_mean_after + ' AND '
  sql += 'DisgustSD BETWEEN ' + disgust_sd_before + ' AND ' + disgust_sd_after + ' AND '
  //anger
  sql += 'AngerM BETWEEN ' + anger_mean_before + ' AND ' + anger_mean_after + ' AND '
  
  //number and name
  if(number == null && name == null){
    sql += 'AngerSD BETWEEN ' + anger_sd_before + ' AND ' + anger_sd_after
  }else{
    sql += 'AngerSD BETWEEN ' + anger_sd_before + ' AND ' + anger_sd_after + ' AND '
    if(number != null){
      if(name == null){
        sql += 'Image.ID = ' + number
      } else {
        sql += 'Image.ID = ' + number + ' AND '
      }
      
    }
    if(name != null){
      sql += "Image.Name = '" + name + "'"
    }
  }

  //get sql results and send them to the template
  const row = db.prepare(sql).all()
  res.render('template', {
    pictures: row,
    results: false
  });

});

app.post("/result", function(req, res) {

  //get all chosen pictures
  var pics = String(req.body.chosen)

  if(pics != "undefined"){
    
    var chosen = pics.split(",")
    
    sql = "SELECT * FROM Image JOIN Location WHERE Location.ID = Image.ID AND ("
    
    for(let i=0; i<chosen.length; i++){
      if(i != chosen.length - 1){
        sql += 'Image.ID = ' + chosen[i] + ' OR '
      }else{
        sql += 'Image.ID = ' + chosen[i] + ')'
      }
    }

    var folder = String(req.body.foldername)
    var dir = './tests/' + folder;

    if (!fs.existsSync(dir)) {
	    fs.mkdirSync(dir, {
		    recursive: true
	    });
    }

    const results = db.prepare(sql).all()

    for(let j=0; j<results.length; j++){

      let source = "./public" + results[j].Path
      let destination = dir + "/" + results[j].Name + ".jpg"

      fs.copyFileSync(source, destination)
      
    }

    res.render('template', {
      pictures: false,
      results: results
    });
  
  }else{

    const results = []
    res.render('template', {
      pictures: false,
      results: results
    });

  }

})

  
app.listen(3000, function(){
  console.log("http://localhost:3000")
})