const logInDiv = document.getElementById('logInPage');
const mainPageDiv = document.getElementById('mainPage');
const blackJackDiv = document.getElementById('blackJackPage')
const rouletteDiv = document.getElementById('roulettePage')
const crapsDiv = document.getElementById('crapsPage')
const logInButton = document.getElementById('logInButton')
const blackJackButton = document.getElementById('blackJackButton')
const rouletteButton = document.getElementById('rouletteButton')
const crapsButton = document.getElementById('crapsButton')
const backButtonBlackJack = document.getElementById('backButtonBlackJack')
const backButtonRoulette = document.getElementById('backButtonRoulette')
const backCrapsButton = document.getElementById('backButtonCraps')
const listOfDivs = document.querySelectorAll('div');
const dealersHandBlackJack = document.getElementById('dealersHandBlackJack')
const playersHandBlackJack = document.getElementById('playersHandBlackJack')
const dealersHandCraps = document.getElementById('dealersHandCraps')
const playersHandCraps = document.getElementById('playersHandCraps')
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
const crapsInput = document.getElementById('crapsInput');
const crapsSelfBetButton = document.getElementById('selfBetButton');
const crapsTieBetButton = document.getElementById('tieBetButton');
const dailyRewardButton = document.getElementById('dailyRewardButton');
const darkModeButton = document.getElementById('darkModeButton');
const leaderBoardButton = document.getElementById('leaderBoardButton');
const leaderBoardPage = document.getElementById('leaderBoardPage');
const backButtonLeaderBoard = document.getElementById('backButtonLeaderBoard');
//This is my punishment for not learning jQuery
const debug = true; //nice bool that lets me turn on and off prints easily


let balance = 0;
function clearBlackJack(){ //clears the prev games
    dealersHandBlackJack.innerHTML = "Dealer's Cards: "
    playersHandBlackJack.innerHTML = "Player's Cards: "
}
function clearCraps(){
    dealersHandCraps.innerHTML = "Dealer's Cards: "
    playersHandCraps.innerHTML = "Player's Cards: "
}
function showDiv(divToShow) { //this controls what "page" is showing
    clearBlackJack()
    clearCraps()
    if(!checkLogIn()){
        divToShow = logInDiv;
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
function logInValidation(usernameAttempt, passwordAttempt){ //you know how it is
    //TODO: request server
    return true;
}
function checkLogIn(){ //makes sure the user if logged in
    return sessionStorage.getItem("username") != null
}
function logIn(usernameAttempt, passwordAttempt) {
    if(logInValidation(usernameAttempt, passwordAttempt)){
        sessionStorage.setItem('username', 'User123'); //sets a session var to control variable
        showDiv(mainPageDiv);
    }
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
function addDealerCardCraps(num){
    dealersHandCraps.innerHTML += numToString(num);
}
function addPlayerCardBlackJack(num){
    playersHandBlackJack.innerHTML += numToString(num);
}
function addPlayerCardCraps(num){
    playersHandCraps.innerHTML += numToString(num);
}

function updateBalance(newBalance){ //this will update all the balances on client side
    balance = newBalance;
    for(let item of balanceLabels){
        item.innerText = "Current Balance: $" + newBalance;
    }
}

function addBalance(delta){ //this is used to change the balance
    updateBalance(balance + delta);
}


let animals = ["Lion", "Tiger", "Elephant", "Giraffe", "Zebra", "Kangaroo", "Panda", "Dolphin", "Wolf", "Leopard"];
let adjectives = ["happy", "sad", "bright", "dark", "fast", "slow", "strong", "weak", "big", "small"]

function getRandomInt(max){
    return Math.floor(Math.random() * max)
}

function generateRandomUsername(){
    //returns a users name that follows the format {adj} + {animal} + {0-99}
    usernameInput.value = adjectives[getRandomInt(10)] + animals[getRandomInt(10)] + getRandomInt(100);
}

function rouletteStraightBet(guess, betSize){
    if(debug){
        console.log("R Bet direct " + guess + ", " + betSize);
    }
    if(betSize == ''|| !checkLogIn()){
        return;
    }
    //TODO: send number to server with betSize
    addBalance(-1 * betSize);
}

function rouletteColorBet(redBool, blackBool, betSize){
    if(debug){
        console.log("R Bet color " + redBool + ", " + blackBool + ", " + betSize);
    }
    if(betSize == ''|| !checkLogIn()){
        return;
    }
    addBalance(-1 * betSize);
}

function rouletteEvenOddBet(oddBool, evenBool, betSize){
    if(debug){
        console.log("R Bet evenOdd " + oddBool + ", " + evenBool + ", " + betSize);
    }
    if(betSize == ''|| !checkLogIn()){
        return;
    }
    addBalance(-1 * betSize);
}

function crapsWinBet(betSize){
    if(debug){
        console.log("C Bet self: " + betSize);
    }
    if(betSize == '' || !checkLogIn()){
        return;
    }
    addBalance(-1 * betSize);
}

function crapsTieBet(betSize){
    if(debug){
        console.log("C Bet Tie: " + betSize);
    }
    if(betSize == ''|| !checkLogIn()){
        return;
    }
    addBalance(-1 * betSize);
}

function requestDailyReward(){
    if(debug){
        console.log("requesting daily")
    }
    if(!checkLogIn()){
        return;
    }
    addBalance(1000)
}

function darkMode(){
    document.body.style.backgroundColor = "dimGray";
}

backButtonLeaderBoard.addEventListener("click", () => {showDiv(mainPageDiv)});
leaderBoardButton.addEventListener("click", () => {showDiv(leaderBoardPage)});
darkModeButton.addEventListener('click', () => darkMode());
dailyRewardButton.addEventListener("click", () => requestDailyReward());
crapsTieBetButton.addEventListener("click", () => crapsTieBet(crapsInput.value));
crapsSelfBetButton.addEventListener("click", () => crapsWinBet(crapsInput.value));
rouletteEvenOddButton.addEventListener('click', () => rouletteEvenOddBet(rouletteOddButton.checked, rouletteEvenButton.checked, rouletteInput.value));
rouletteStraightUpBetButton.addEventListener("click", () => rouletteStraightBet(rouletteStraightUpBetInput.value, rouletteInput.value));
rouletteColorBetButton.addEventListener("click", () => rouletteColorBet(rouletteRedButton.checked, rouletteBlackButton.checked, rouletteInput.value));
randomUsernameButton.addEventListener('click', () => generateRandomUsername())
logInButton.addEventListener('click', () => logIn(usernameInput.value, passwordInput.value));
backButtonBlackJack.addEventListener('click', () => {showDiv(mainPageDiv);})
backButtonRoulette.addEventListener('click', () => {showDiv(mainPageDiv);})
backCrapsButton.addEventListener('click', () => {showDiv(mainPageDiv);})
blackJackButton.addEventListener('click', () => {showDiv(blackJackDiv);})
rouletteButton.addEventListener('click', () => {showDiv(rouletteDiv);})
crapsButton.addEventListener('click', () => {showDiv(crapsDiv);})
