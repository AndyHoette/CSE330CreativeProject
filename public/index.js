let socketio = io.connect();
socketio.on("messageToClient", function(data){
    console.log(data);
})
const logInDiv = document.getElementById('logInPage');
const mainPageDiv = document.getElementById('mainPage');
const blackJackDiv = document.getElementById('blackJackPage')
const rouletteDiv = document.getElementById('roulettePage')
const baccaratDiv = document.getElementById('baccaratPage')
const logInButton = document.getElementById('logInButton')
const blackJackButton = document.getElementById('blackJackButton')
const rouletteButton = document.getElementById('rouletteButton')
const baccaratButton = document.getElementById('baccaratButton')
const backButtonBlackJack = document.getElementById('backButtonBlackJack')
const backButtonRoulette = document.getElementById('backButtonRoulette')
const backBaccaratButton = document.getElementById('backButtonBaccarat')
const listOfDivs = document.querySelectorAll('div');
const dealersHandBlackJack = document.getElementById('dealersHandBlackJack')
const playersHandBlackJack = document.getElementById('playersHandBlackJack')
const dealersHandBaccarat = document.getElementById('dealersHandBaccarat')
const playersHandBaccarat = document.getElementById('playersHandBaccarat')
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const balanceLabels = document.getElementsByClassName("balance");
const randomUsernameButton = document.getElementById('randomUsernameButton');
const rouletteStraightUpBetButton = document.getElementById('StraightUpButton');
const rouletteStraightUpBetInput = document.getElementById('StraightUpBet');
const rouletteInput = document.getElementById('rouletteInput');
const rouletteColorBetButton = document.getElementById('colorBetButton');
const rouletteRedButton = document.getElementById('redBet');
const rouletteBlackButton = document.getElementById('blackBet');
const rouletteEvenOddButton = document.getElementById('EvenOddBetButton');
const rouletteOddButton = document.getElementById('oddBet');
const rouletteEvenButton = document.getElementById('evenBet');
const baccaratInput = document.getElementById('baccaratInput');
const baccaratSelfBetButton = document.getElementById('selfBetButton');
const baccaratTieBetButton = document.getElementById('tieBetButton');
const dailyRewardButton = document.getElementById('dailyRewardButton');
const darkModeButton = document.getElementById('darkModeButton');
const leaderBoardButton = document.getElementById('leaderBoardButton');
const leaderBoardPage = document.getElementById('leaderBoardPage');
const backButtonLeaderBoard = document.getElementById('backButtonLeaderBoard');
const newUsernameInput = document.getElementById('newUsernameInput');
const newPasswordInput = document.getElementById('newPasswordInput');
const createAccountButton = document.getElementById('createAccountButton');
const listOfPlayers = document.getElementById('listOfPlayers');
const crapsDiv = document.getElementById('crapsPage');
const crapsButton = document.getElementById('crapsButton');
const crapsInput = document.getElementById('crapsInput');
const crapsPlayButton = document.getElementById('crapsPlayButton');
const crapsRolls = document.getElementById('crapsRolls');
const backButtonCraps = document.getElementById('backButtonCraps');
const rouletteResult = document.getElementById('rouletteResult');
//This is my punishment for not learning jQuery
const debug = true; //nice bool that lets me turn on and off prints easily


let balance = 0;
function clearBlackJack(){ //clears the prev games
    dealersHandBlackJack.innerHTML = "Dealer's Cards: "
    playersHandBlackJack.innerHTML = "Player's Cards: "
}
function clearBaccarat(){
    dealersHandBaccarat.innerHTML = "Dealer's Cards: "
    playersHandBaccarat.innerHTML = "Player's Cards: "
}
function showDiv(divToShow) { //this controls what "page" is showing
    clearBlackJack()
    clearBaccarat()
    if(!checkLogIn()){
        divToShow = logInDiv;
    }
    if(divToShow === leaderBoardPage){
        requestLeaderBoard();
    }
    listOfDivs.forEach(
        (div) => {
            if(div!==divToShow){
                div.style.display = 'none';
            }
            else{
                div.style.display = 'block';
            }
        }
    )
}
function checkLogIn(){ //makes sure the user if logged in
    return sessionStorage.getItem("username") != null
}
function logIn(usernameAttempt, passwordAttempt) {
    socketio.emit("login", {"username": usernameAttempt, "password": passwordAttempt});
}

function createAccount(newUsername, newPassword){
    if(debug){
        console.log("creating account: " + newUsername + ", " + newPassword);
    }
    socketio.emit("createAccount", {"username": newUsername, "newPassword": newPassword});
}

function numToString(num){ //this converts a number to a card
    let str = " "
    if(num%13 === 0){
        str += "K";
    }
    else if(num%13 === 1){
        str += "A";
    }
    else if(num%13 === 11){
        str += "J";
    }
    else if(num%13 === 12){
        str += "Q";
    }
    else{
        str += num%13;
    }
    if(Math.floor(num/13)===0){
        str += "♠";
    }
    else if(Math.floor(num/13)===1){
        str += "♥";
    }
    else if(Math.floor(num/13)===2){
        str += "♣";
    }
    else{
        str += "♦";
    }
    return str;
}

function addDealerCardBlackJack(num){
    dealersHandBlackJack.innerHTML += numToString(num);
}
function addDealerCardBaccarat(num){
    dealersHandBaccarat.innerHTML += numToString(num);
}
function addPlayerCardBlackJack(num){
    playersHandBlackJack.innerHTML += numToString(num);
}
function addPlayerCardBaccarat(num){
    playersHandBaccarat.innerHTML += numToString(num);
}

function addCrapsRoll(num){
    crapsRolls.innerHTML += num + " ";
}

function updateBalance(newBalance){ //this will update all the balances on client side
    balance = newBalance;
    for(let item of balanceLabels){
        item.innerText = "Current Balance: $" + newBalance;
    }
}

function getBalance(){
    if(!checkLogIn()){
        updateBalance(0);
        return;
    }
    socketio.emit("requestBalance", {"username": sessionStorage.getItem("username")})
}

let animals = ["Lion", "Tiger", "Elephant", "Giraffe", "Zebra", "Kangaroo", "Panda", "Dolphin", "Wolf", "Leopard"];
let adjectives = ["happy", "sad", "bright", "dark", "fast", "slow", "strong", "weak", "big", "small"]

function getRandomInt(max){
    return Math.floor(Math.random() * max)
}

function generateRandomUsername(){
    //returns a users name that follows the format {adj} + {animal} + {0-99}
    newUsernameInput.value = adjectives[getRandomInt(10)] + animals[getRandomInt(10)] + getRandomInt(100);
}

function rouletteStraightBet(guess, betSize){
    if(debug){
        console.log("R Bet direct " + guess + ", " + betSize);
    }
    if(betSize == ''|| !checkLogIn()){
        return;
    }
    socketio.emit("rouletteStraightBet", {"username": sessionStorage.getItem("username"), "betSize": betSize, "numGuess": guess});
}

function rouletteColorBet(redBool, blackBool, betSize){
    if(debug){
        console.log("R Bet color " + redBool + ", " + blackBool + ", " + betSize);
    }
    if(betSize == ''|| !checkLogIn()){
        return;
    }
    socketio.emit("rouletteColorBet", {"username": sessionStorage.getItem("username"), "betSize": betSize, "redBool": redBool, "blackBool": blackBool});
}

function rouletteEvenOddBet(oddBool, evenBool, betSize){
    if(debug){
        console.log("R Bet evenOdd " + oddBool + ", " + evenBool + ", " + betSize);
    }
    if(betSize == ''|| !checkLogIn()){
        return;
    }
    socketio.emit("rouletteEvenOddBet", {"username": sessionStorage.getItem("username"), "betSize": betSize, "oddBool": oddBool, "evenBool": evenBool});
}

function baccaratWinBet(betSize){
    if(debug){
        console.log("C Bet self: " + betSize);
    }
    if(betSize == '' || !checkLogIn()){
        return;
    }
    socketio.emit("baccaratWinBet", {"username": sessionStorage.getItem("username"), "betSize": betSize})
}

function baccaratTieBet(betSize){
    if(debug){
        console.log("C Bet Tie: " + betSize);
    }
    if(betSize == ''|| !checkLogIn()){
        return;
    }
    socketio.emit("baccaratTieBet", {"username": sessionStorage.getItem("username"), "betSize": betSize})
}

function crapsBet(betSize){
    if(debug){
        console.log("Bet craps: " + betSize);
    }
    if(betSize == '' || !checkLogIn()){
        return;
    }
    socketio.emit("crapsBet", {"username": sessionStorage.getItem("username"), "betSize": betSize});
}

function requestDailyReward(){
    if(debug){
        console.log("requesting daily")
    }
    if(!checkLogIn()){
        return;
    }
    socketio.emit("requestDaily", {"username": sessionStorage.getItem("username")});
}

function darkMode(){
    document.body.style.backgroundColor = "dimGray";
}

function updateLeaderBoard(arrOfPlayers){
    if(debug){
        console.log("updateLeaderBoard: " + arrOfPlayers[0].username);
    }
    for(let i = 0; i < arrOfPlayers.length; i++){
        const newListItem = document.createElement('li');
        newListItem.innerHTML = arrOfPlayers[i].username + ": $" + arrOfPlayers[i].balance;
        listOfPlayers.appendChild(newListItem);
    }
}

function requestLeaderBoard(){
    socketio.emit("updateLeaderBoard", {});
}

socketio.on("loginResolved", function(data){
    if(!data["success"]){
        return;
    }
    sessionStorage.setItem("username", data["username"]);
    showDiv(mainPageDiv);
});

socketio.on("balanceUpdated", function(data){
    updateBalance(data["balance"]);
});

socketio.on("rouletteResolved", function(data){
    rouletteResult.innerHTML = "It was a " + data["result"];
});

socketio.on("baccaratUserCard", function(data){
    addPlayerCardBaccarat(data["card"]);
});

socketio.on("baccaratDealerCard", function(data){
    addDealerCardBaccarat(data["card"]);
});

socketio.on("crapsRoll", function(data){
    addCrapsRoll(data["roll"]);
});

socketio.on("leaderBoardResolved", function(data){
    if(debug){
        console.log("leaderBoardResolved");
        console.log(data);
    }
    updateLeaderBoard(data);
})

//socketio.emit("messageToServer", {"message": "hi"});

createAccountButton.addEventListener('click', () => createAccount(newUsernameInput.value, newPasswordInput.value));
backButtonLeaderBoard.addEventListener("click", () => {showDiv(mainPageDiv)});
leaderBoardButton.addEventListener("click", () => {showDiv(leaderBoardPage)});
darkModeButton.addEventListener('click', () => darkMode());
dailyRewardButton.addEventListener("click", () => requestDailyReward());
baccaratTieBetButton.addEventListener("click", () => baccaratTieBet(baccaratInput.value));
baccaratSelfBetButton.addEventListener("click", () => baccaratWinBet(baccaratInput.value));
rouletteEvenOddButton.addEventListener('click', () => rouletteEvenOddBet(rouletteOddButton.checked, rouletteEvenButton.checked, rouletteInput.value));
rouletteStraightUpBetButton.addEventListener("click", () => rouletteStraightBet(rouletteStraightUpBetInput.value, rouletteInput.value));
rouletteColorBetButton.addEventListener("click", () => rouletteColorBet(rouletteRedButton.checked, rouletteBlackButton.checked, rouletteInput.value));
crapsPlayButton.addEventListener('click', () => {crapsBet(crapsInput.value);});
randomUsernameButton.addEventListener('click', () => generateRandomUsername());
logInButton.addEventListener('click', () => logIn(usernameInput.value, passwordInput.value));
backButtonBlackJack.addEventListener('click', () => {showDiv(mainPageDiv);});
backButtonRoulette.addEventListener('click', () => {showDiv(mainPageDiv);});
backBaccaratButton.addEventListener('click', () => {showDiv(mainPageDiv);});
blackJackButton.addEventListener('click', () => {showDiv(blackJackDiv);});
rouletteButton.addEventListener('click', () => {showDiv(rouletteDiv);});
baccaratButton.addEventListener('click', () => {showDiv(baccaratDiv);});
crapsButton.addEventListener('click', () => {showDiv(crapsDiv);});
backButtonCraps.addEventListener('click', () => {showDiv(mainPageDiv);});
