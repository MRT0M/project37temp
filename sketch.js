var dog, happyDog, database, foodS, foodStock, firebase, fedTime, lastFed;
var gameState="hungry"
var currentTime;

function preload(){
	thedog = loadImage('images/dogImg.png');
  happyDog = loadImage('images/dogImg1.png')
  bedroom=loadImage('images/BedRoom.png')
  washroom=loadImage('images/WashRoom.png')
  garden=loadImage('images/Garden.png')
}

function setup() {
  database=firebase.database()
	createCanvas(displayWidth,displayHeight);
  foodStock=database.ref('Food');
  foodStock.on("value",readStock);

  gameStateRef=database.ref('gameState')
    gameStateRef.on("value",function(data){
      gameState=data.val()
  })

  foodButton=createButton("Add Food");
  foodButton.position(700,95)

  foodButton.mousePressed(addFood)

  feedButton=createButton("Feed Dog");
  feedButton.position(800,95)

  feedButton.mousePressed(feedDog)

  dog=createSprite(850,250,10,10);
  dog.addImage(thedog)
  dog.scale=0.5;

  fedTime=database.ref('FeedTime');
  fedTime.on("value",function(data){
    lastFed=data.val();
  })

  food=new Food()
  currentTime=hour();
}

function draw() {  
  background(46, 139, 87);
  drawSprites();
  textSize(15);
  fill('white')
  text("Food left: "+foodS,250,475);
  if(lastFed>=12){
    text("Last Feed: " + lastFed%12 + "PM",350,30)
  }
  else if(lastFed===0){
    text("Last Feed: " + 12 + "AM",350,30)
  } 
  else {
    text("Last Feed: " + lastFed + "AM",350,30)
  }

  if(gameState!=="hungry"){
    feedButton.hide();
    foodButton.hide();
    dog.remove()
  }
  else {
    feedButton.show()
    foodButton.show()
    feedButton.mousePressed(feedDog)
    dog.addImage(thedog)
  }

  if(currentTime===lastFed+1){
    food.garden();
    updateState("playing")
  }
  else if(currentTime===lastFed+2){
    food.bedroom()
    updateState("sleeping")
  }
  else if(currentTime>lastFed+2 && currentTime<=lastFed+4){
    food.washroom()
    updateState("bathing")
  }
  else {
    food.display();
    updateState("hungry");
  }
}

function readStock(data){
  foodS=data.val()
}

function addFood(){
  foodS++
  
  database.ref('/').update({
    Food:foodS
  });

  database.ref('/').update({
    Food: food.getFoodStock()
  })
}

function feedDog(){
  dog.addImage(happyDog)
  foodS--

  database.ref('/').update({
    Food:foodS
  });

  food.updateFoodStock(food.getFoodStock()-1)
  database.ref('/').update({
    Food: food.getFoodStock(),
    FeedTime: hour()
  })
  
}

function writeStock(x){
  if(x<=0){
    x=0
  } else {
    x--;
  }

  database.ref('/').update({
    Food:x
  });
}

function updateState(state){
  database.ref('/').update({
      gameState: state
  })
}