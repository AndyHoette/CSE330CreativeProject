const express = require('express')
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
    balance: Number,
    lastDayOfReward: {
        type: Number,
        default: () => Math.floor(Date.now() / 86400000)
    },
})
const users = mongoose.model('users', userSchema)
const app = express()
app.use(express.static('./public'))
const rouletteWheel = ["0 green", "32 red", "15 black", "19 red", "4 black",
    "21 red", "2 black", "25 red", "17 black", "34 red", "6 black", "27 red", "13 black", "36 red",
    "11 black", "30 red", "8 black", "23 red", "10 black", "5 red", "24 black", "16 red", "33 black",
    "1 red", "20 black", "14 red", "31 black", "9 red", "22 black", "18 red", "29 black", "7 red",
    "28 black", "12 red", "35 black", "3 red", "26 black"];
let cardNumbersTaken = [];
const port = 3000


app.set('view engine', 'ejs');
app.set('views', './views'); // Path to your .ejs files
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
app.get('/', function (req, res) {
    res.render('index', {balance: "0"});
});


async function createNewUser(newUsername, newPassword){
    const newUser = await userModel.create({
        username: newUsername,
        password: newPassword,
        balance : 10000,
    })
}


function getColor(str){
    const arr = str.split('');
    return arr[1];
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
    dealerTotal = cardValueBlackJack(currCard);
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