const express = require('express')
const app = express();
const server = require("http").createServer(app); //don't ask me about none of this
const io = require("socket.io")(server);
const port = 3000
const debug = true;
//server.listen(port);

app.use(express.static('./public')) //we use the public folder :)
const mongoose = require('mongoose'); //we use mongoDB :)
async function run(){
    try{
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/sampleDB');
        console.log('MongoDB Connected', conn.connection.host);
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
}
run() //connect to the server
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true, //ensures unique usernames
    },
    password: String,
    balance: {
        type: Number,
        default: 10000
    },
    lastDayOfReward: {
        type: Number,
        default: () => Math.floor(Date.now() / 86400000)
    },
})
userSchema.methods.checkPassword = function checkPassword(password){
    return this.password === password; //i know this is bad sorry
}
userSchema.methods.addBalance = function addBalance(delta){
    console.log("attempting " + this.balance + " + " + delta);
    console.log(this)
    this.balance = +this.balance + +delta;
    this.save();
}
userSchema.methods.checkDaily = function checkDaily(){
    return Math.floor(Date.now()/86400000) !== this.lastDayOfReward;
    //Math.floor(Data.now()/86400000) is days since unix epoch if you got your last reward wasn't the same day
}
userSchema.methods.updateDaily = function updateDaily(){
    this.lastDayOfReward = Math.floor(Date.now()/86400000); //this just makes it back
    this.save();
}
userSchema.methods.getMyBalance = function getMyBalance(){
    return this.balance;
}
const User = mongoose.model('users', userSchema)
let cardNumbersTaken = []; //this is used in card games to ensure we don't have dupes


app.set('view engine', 'ejs');
app.set('views', './views'); // Path to your .ejs files
app.use(express.json());
app.use(express.urlencoded({extended: true}));


server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
app.get('/', function (req, res) {
    res.render('index', {balance: "0"});
}); //make the default website render index with some server side rendering


async function createNewUser(newUsername, newPassword, socket){
    try{
        const newUser = new User({
            username: newUsername,
            password: newPassword,
        })
        await newUser.save(); //create a new one and send the username back
        socket.emit("loginResolved", {"success": true, "username": newUsername});
    }
    catch(err){ //the most likely reason to get here is if the username is already taken
        socket.emit("loginResolved", {"success": false});
    }
}

async function getLeaderBoard(socket){
    //sends back the list of all users in top down order
    const orderedListOfUsers = await User.find().sort({balance: -1}).select('username balance -_id').lean();
    socket.emit("leaderBoardResolved", orderedListOfUsers);
}

//these three methods are helper methods for roullette
function getColor(str){
    const arr = str.split(' ');
    return arr[1];
}
function getNumber(str){
    const arr = str.split(' ');
    return arr[0];
}
function isEven(str){
    const arr = str.split(' ');
    // noinspection EqualityComparisonWithCoercionJS
    return arr[0] % 2 === 0 && arr[0] != 0;
}

//rip blackjack
function maxValueBlackjack(value, hasAce){
    if(!hasAce){
        return value;
    }
    return value+10 > 21 ? value : value+10;
}

//helper method for baccarat%
function cardValueBaccarat(num){
    if(num % 13 === 0 || num % 13 === 11 || num % 13 === 12 || num % 13 === 10){
        return 0;
    }
    return num%13;
}
function cardValueBlackJack(num){
    if(num % 13 === 0 || num % 13 === 11 || num % 13 === 12){
        return 10;
    }
    return num%13;
}
//think this might be build into js but i made it myself it gets a random int from [0, max-1]
function getRandomInt(max){
    return Math.floor(Math.random() * max)
}
function drawCard(){
    let possibleNumber = getRandomInt(52);
    while(possibleNumber in cardNumbersTaken){
        possibleNumber = getRandomInt(52);
    }
    cardNumbersTaken.push(possibleNumber);
    return possibleNumber; //this returns a unique (not in cardNumbersTaken) number [0, 51]
}
function natural(num1, num2){ //helper for baccarat
    return num1===8 || num2===8 || num1===9 || num2===9;
}
function findBaccaratWinner(playerTotal, dealerTotal){
    if(playerTotal > dealerTotal){
        return 1;
    }
    if(dealerTotal > playerTotal){
        return -1;
    }
    return 0;
}
function findBlackJackWinner(playerTotal, dealerTotal){
    if(playerTotal > 21){
        return -1;
    }
    if(dealerTotal > 21){
        return 1;
    }
    if(playerTotal > dealerTotal){
        return 1;
    }
    else if(dealerTotal > playerTotal){
        return -1;
    }
    return 0;
}
function playBaccarat(socket){
    cardNumbersTaken = [];
    let score = NaN;
    let playerTotal = 0;
    let dealerTotal = 0;
    let currCard = drawCard(); //after every draw card we send a message to the client to update their gui
    socket.emit("baccaratUserCard", {"card": currCard});
    playerTotal += cardValueBaccarat(currCard);
    currCard = drawCard();
    socket.emit("baccaratUserCard", {"card": currCard});
    playerTotal += cardValueBaccarat(currCard);
    playerTotal = playerTotal % 10;
    currCard = drawCard();
    socket.emit("baccaratDealerCard", {"card": currCard});
    dealerTotal += cardValueBaccarat(currCard);
    currCard = drawCard();
    socket.emit("baccaratDealerCard", {"card": currCard});
    dealerTotal += cardValueBaccarat(currCard);
    dealerTotal = dealerTotal % 10;
    if(natural(playerTotal, dealerTotal)){ //if either player is "natural"
        score = findBaccaratWinner(playerTotal, dealerTotal);
        return score;
    }
    if(playerTotal < 6){ //get a new card if you are <6
        currCard = drawCard();
        socket.emit("baccaratUserCard", {"card": currCard});
        playerTotal += cardValueBaccarat(currCard);
        playerTotal = playerTotal % 10;
    }
    if(dealerTotal < 6){ //same as above
        currCard = drawCard();
        socket.emit("baccaratDealerCard", {"card": currCard});
        dealerTotal += cardValueBaccarat(currCard);
        dealerTotal = playerTotal % 10;
    }
    score = findBaccaratWinner(playerTotal, dealerTotal);
    return score;
}
function isAce(num){ //helper method for blackjack rip
    return num%13 === 1;
}

//so sad i didn't get to do this
function playBlackJack(betSize){
    cardNumbersTaken = [];
    let playerTotal = 0;
    let playerHasAce = false;
    let dealerTotal = 0;
    let dealerHasAce = false;
    let currCard = drawCard();
    if(isAce(currCard)){
        playerHasAce = true;
    }
    playerTotal += cardValueBlackJack(currCard);
    currCard = drawCard();
    if(isAce(currCard)){
        playerHasAce = true;
    }
    playerTotal += cardValueBlackJack(currCard);
    currCard = drawCard();
    if(isAce(currCard)){
        dealerHasAce = true;
    }
    dealerTotal += cardValueBlackJack(currCard);
    //await response
    while(maxValueBlackjack(dealerTotal, dealerHasAce) < 17 || (dealerTotal === 7 && dealerHasAce)){
        currCard = drawCard();
        if(isAce(currCard)){
            dealerHasAce = true;
        }
        dealerTotal += cardValueBlackJack(currCard);
    }
    const score = findBlackJackWinner(maxValueBlackjack(playerTotal, playerHasAce), maxValueBlackjack(dealerTotal, dealerHasAce));
    if(score === 1){
    }
    else if(score === -1){
    }
    else{
    }
}

//this generates the result of 2 dice rolls in a good way
function randomDice(){
    return getRandomInt(6) + getRandomInt(6)+ 2;
}

function playCraps(socket){ //returns true if the player wins
    let roll = randomDice();
    socket.emit("crapsRoll", {"roll": roll});
    if(roll === 7 || roll === 11){
        return true;
    }
    else if(roll === 2 || roll === 3 || roll === 12){
        return false;
    }
    let roll2 = -1;
    while(roll2 !== roll && roll2 !== 7){
        roll2 = randomDice();
        socket.emit("crapsRoll", {"roll": roll2}); //spits these out to the screen
    }
    return roll2 === roll;
}
const rouletteWheel = ["0 green", "32 red", "15 black", "19 red", "4 black",
    "21 red", "2 black", "25 red", "17 black", "34 red", "6 black", "27 red", "13 black", "36 red",
    "11 black", "30 red", "8 black", "23 red", "10 black", "5 red", "24 black", "16 red", "33 black",
    "1 red", "20 black", "14 red", "31 black", "9 red", "22 black", "18 red", "29 black", "7 red",
    "28 black", "12 red", "35 black", "3 red", "26 black"]; //im sure there's a pattern but i typed this out
function playRoulette(){ //very complex code
    return rouletteWheel[getRandomInt(rouletteWheel.length)];
}

function rouletteStraightBet(data, socket){
    const result = playRoulette();
    socket.emit("rouletteResolved", {"result": result}); //sends the result first
    const numberSpun = getNumber(result);
    if(numberSpun === data["numGuess"]){
        updateBalance(data["username"], 35 * data["betSize"]); //35:1 pay out
        return;
    }
    updateBalance(data["username"], -1 * data["betSize"]);
}

function rouletteColorBet(data, socket){ //the way the code is written allows the user to bet on neither black or red
    if(debug){
        console.log("roulette color bet");
        console.log(data);
    }
    const result = playRoulette();
    if(debug){
        console.log(result);
    }
    socket.emit("rouletteResolved", {"result": result});
    const colorSpun = getColor(result);
    if(debug){
        console.log(colorSpun);
    }
    if(colorSpun === "red" && data["redBool"]){
        if(debug){
            console.log("won with red!");
        }
        updateBalance(data["username"], data["betSize"]);
        return;
    }
    else if(colorSpun === "black" && data["blackBool"]){
        if(debug){
            console.log("won with black!");
        }
        updateBalance(data["username"], data["betSize"]);
        return;
    }
    if(debug){
        console.log("lost")
    }
    updateBalance(data["username"], -1 * data["betSize"]);
}

function rouletteEvenOddBet(data, socket){ //same as above
    const result = playRoulette();
    socket.emit("rouletteResolved", {"result": result});
    const evenSpun = isEven(result);
    if(evenSpun && data["evenBool"]){
        updateBalance(data["username"], data["betSize"]);
        return;
    }
    else if(!evenSpun && data["oddBool"]){
        updateBalance(data["username"], data["betSize"]);
        return;
    }
    updateBalance(data["username"], -1 * data["betSize"]);
}

function baccaratWinBet(data, socket){ //simply gives 1:1 if you win
    const result = playBaccarat(socket);
    if(result === 1){
        updateBalance(data["username"], data["betSize"]);
        return;
    }
    updateBalance(data["username"], -1 * data["betSize"]);
}

function baccaratTieBet(data, socket){ //9:1 for tie bet
    const result = playBaccarat(socket);
    if(result === 0){
        updateBalance(data["username"], 9 * data["betSize"]);
        return;
    }
    updateBalance(data["username"], -1 * data["betSize"]);
}

function crapsBet(data, socket){ //the simpliest game
    const result = playCraps(socket);
    if(result){
        updateBalance(data["username"], 1 * data["betSize"]);
        return;
    }
    updateBalance(data["username"], -1 * data["betSize"]);
}

async function checkLogin(data, socket){ //called when we get "login"
    //data should have username and password
    const existsBool = await User.exists({username : data["username"]});
    if(!existsBool){
        socket.emit("loginResolved", {"success": false}); //if there is no one with the users name no need to check password
        return;
    }
    const possibleUser = await User.findOne({username : data["username"]});
    if(possibleUser.checkPassword(data["password"])){
        socket.emit("loginResolved", {"success": true, "username": data["username"]});
        getBalance(data["username"], socket);
        return;
    }
    socket.emit("loginResolved", {"success": false});
}

async function getBalance(username, socket){
    //simply tells the user what its balance is
    const existsBool = await User.exists({username : username});
    if(!existsBool){
        return;
    }
    const possibleUser = await User.findOne({username : username});
    socket.emit("balanceUpdated", {"balance" : possibleUser.getMyBalance()});
}

async function updateBalance(username, delta){
    //changes the balance and nothing else
    const existsBool = await User.exists({username : username});
    if(!existsBool){
        return;
    }
    const possibleUser = await User.findOne({username : username});
    possibleUser.addBalance(delta);
}

async function getDaily(username){

    const existsBool = await User.exists({username : username});
    if(!existsBool){
        return;
    }
    const possibleUser = await User.findOne({username : username});
    if(possibleUser.checkDaily()){
        await updateBalance(username, 1000);
        possibleUser.updateDaily(); //simply adds $1000 if you can get your daily
    }
}

io.sockets.on('connection', function(socket){
    socket.on("login", function(data){
        checkLogin(data, socket);
    });
    socket.on("createAccount", function(data){
        createNewUser(data["username"], data["password"], socket);
    });
    socket.on("requestBalance", function(data){
        getBalance(data["username"], socket);
    });
    socket.on("requestDaily", function(data){
        getDaily(data["username"]);
        setTimeout(getBalance(data["username"], socket), 500);
        //these time out are race conditions :( but should work 99% of the time
        //most methods need us updating the user after they happen
    });
    socket.on("updateLeaderBoard", function(data){
        getLeaderBoard(socket);
        setTimeout(() => getBalance(data["username"], socket), 500);
    });
    socket.on("rouletteStraightBet", function(data){
        rouletteStraightBet(data, socket);
        setTimeout(() => getBalance(data["username"], socket), 500);
    });
    socket.on("rouletteColorBet", function(data){
        rouletteColorBet(data, socket);
        setTimeout(() => getBalance(data["username"], socket), 500);
    });
    socket.on("rouletteEvenOddBet", function(data){
        rouletteEvenOddBet(data, socket);
        setTimeout(() => getBalance(data["username"], socket), 500);
    });
    socket.on("baccaratWinBet", function(data){
        baccaratWinBet(data, socket);
        setTimeout(() => getBalance(data["username"], socket), 500);
    });
    socket.on("baccaratTieBet", function(data){
        baccaratTieBet(data, socket);
        setTimeout(() => getBalance(data["username"], socket), 500);
    });
    socket.on("crapsBet", function(data){
        crapsBet(data, socket);
        setTimeout(() => getBalance(data["username"], socket), 500);
    })
})