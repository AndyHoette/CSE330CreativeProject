const express = require('express')
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = 3000

//server.listen(port);

app.use(express.static('./public'))
const mongoose = require('mongoose');
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
run()
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
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
    return this.password === password;
}
userSchema.methods.addBalance = function addBalance(delta){
    this.balance += delta;
}
userSchema.methods.checkDaily = function checkDaily(){
    return Math.floor(Date.now()/86400000) !== this.lastDayOfReward;
}
userSchema.methods.getMyBalance = function getMyBalance(){
    return this.balance;
}
const User = mongoose.model('users', userSchema)
let cardNumbersTaken = [];


app.set('view engine', 'ejs');
app.set('views', './views'); // Path to your .ejs files
app.use(express.json());
app.use(express.urlencoded({extended: true}));


server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
app.get('/', function (req, res) {
    res.render('index', {balance: "0"});
});


async function createNewUser(newUsername, newPassword, socket){
    try{
        const newUser = new User({
            username: newUsername,
            password: newPassword,
        })
        await newUser.save();
        socket.emit("loginResolved", {"success": true, "username": newUsername});
    }
    catch(err){
        socket.emit("loginResolved", {"success": false});
    }
}

async function getLeaderBoard(socket){
    const orderedListOfUsers = await User.find().sort({balance: -1}).select('username balance -_id').lean();
    socket.emit("leaderBoardResolved", orderedListOfUsers);
}

//getLeaderBoard();
function newDay(daySinceEpoch){
    return daySinceEpoch !== Math.floor(Date.now() / 86400000);
}

function getColor(str){
    const arr = str.split('');
    return arr[1];
}
function getNumber(str){
    const arr = str.split('');
    return arr[0];
}
function isEven(str){
    const arr = str.split('');
    // noinspection EqualityComparisonWithCoercionJS
    return arr[0] % 2 === 0 && arr[0] != 0;
}
function maxValueBlackjack(value, hasAce){
    if(!hasAce){
        return value;
    }
    return value+10 > 21 ? value : value+10;
}
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
function getRandomInt(max){
    return Math.floor(Math.random() * max)
}
function drawCard(){
    let possibleNumber = getRandomInt(52);
    while(possibleNumber in cardNumbersTaken){
        possibleNumber = getRandomInt(52);
    }
    cardNumbersTaken.push(possibleNumber);
    return possibleNumber;
}
function natural(num1, num2){
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
function playBaccarat(betSize){
    cardNumbersTaken = [];
    let score = NaN;
    let playerTotal = 0;
    let dealerTotal = 0;
    let currCard = drawCard();
    //TODO: Send card to client side
    playerTotal += cardValueBaccarat(currCard);
    currCard = drawCard();
    playerTotal += cardValueBaccarat(currCard);
    playerTotal = playerTotal % 10;
    currCard = drawCard();
    dealerTotal += cardValueBaccarat(currCard);
    currCard = drawCard();
    dealerTotal += cardValueBaccarat(currCard);
    dealerTotal = dealerTotal % 10;
    if(natural(playerTotal, dealerTotal)){
        score = findBaccaratWinner(playerTotal, dealerTotal);
        if(score === 1){
            //TODO: add/sub bet size to players money
        }
        else if(score === -1){
            //same as above
        }
        else{
            //TODO: display the result
        }
    }
    if(playerTotal < 6){
        currCard = drawCard();
        playerTotal += cardValueBaccarat(currCard);
        playerTotal = playerTotal % 10;
    }
    if(dealerTotal < 6){
        currCard = drawCard();
        dealerTotal += cardValueBaccarat(currCard);
        dealerTotal = playerTotal % 10;
    }
    score = findBaccaratWinner(playerTotal, dealerTotal);
    if(score === 1){
        //TODO: add/sub bet size to players money
    }
    else if(score === -1){
        //same as above
    }
    else{
        //TODO: display the result
    }
}
function isAce(num){
    return num%13 === 1;
}
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
    //TODO: continue hitting for as long as the player wants
    while(maxValueBlackjack(dealerTotal, dealerHasAce) < 17 || (dealerTotal === 7 && dealerHasAce)){
        currCard = drawCard();
        if(isAce(currCard)){
            dealerHasAce = true;
        }
        dealerTotal += cardValueBlackJack(currCard);
    }
    const score = findBlackJackWinner(maxValueBlackjack(playerTotal, playerHasAce), maxValueBlackjack(dealerTotal, dealerHasAce));
    if(score === 1){
        //TODO: player wins
    }
    else if(score === -1){
        //TODO: dealer wins
    }
    else{
        //TODO: draw
    }
}

function randomDice(){
    return getRandomInt(6) + getRandomInt(6)+ 2;
}

function playCraps(betSize){
    let roll = randomDice();
    if(roll === 7 || roll === 11){
        //TODO: Win
    }
    else if(roll === 2 || roll === 3 || roll === 12){
        //Lose
    }
    let roll2 = -1;
    while(roll2 !== roll && roll2 !== 7){
        roll2 = randomDice();
    }
    if(roll2 === roll){
        //win
    }
    //lose
}
const rouletteWheel = ["0 green", "32 red", "15 black", "19 red", "4 black",
    "21 red", "2 black", "25 red", "17 black", "34 red", "6 black", "27 red", "13 black", "36 red",
    "11 black", "30 red", "8 black", "23 red", "10 black", "5 red", "24 black", "16 red", "33 black",
    "1 red", "20 black", "14 red", "31 black", "9 red", "22 black", "18 red", "29 black", "7 red",
    "28 black", "12 red", "35 black", "3 red", "26 black"];
function playRoulette(){
    return rouletteWheel[getRandomInt(rouletteWheel.length)];
}

function rouletteStraightBet(data, socket){
    const numberSpun = getNumber(playRoulette());
    if(numberSpun === data["numGuess"]){

    }
}

async function checkLogin(data, socket){
    const existsBool = await User.exists({username : data["username"]});
    if(!existsBool){
        socket.emit("loginResolved", {"success": false});
        return;
    }
    const possibleUser = await User.findOne({username : data["username"]});
    if(possibleUser.checkPassword(data["password"])){
        socket.emit("loginResolved", {"success": true, "username": data["username"]});
        return;
    }
    socket.emit("loginResolved", {"success": false});
}

async function getBalance(username, socket){
    const existsBool = await User.exists({username : username});
    if(!existsBool){
        return;
    }
    const possibleUser = await User.findOne({username : username});
    socket.emit("balanceUpdated", {"balance" : possibleUser.getMyBalance()});
}

async function updateBalance(username, delta){
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
    })
    socket.on("requestDaily", function(data){
        getDaily(data["username"]);
        getBalance(data["username"], socket);
    })
    socket.on("updateLeaderBoard", function(data){
        getLeaderBoard(socket);
    })
    socket.on("rouletteStraightBet", function(data){

    })
})