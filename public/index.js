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
function showDiv(divToShow) {
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
function logInValidation(){
    return true;
}
function logIn(){
    if(logInValidation()){
        sessionStorage.setItem('username', 'User123');
        showDiv(mainPageDiv);
    }
}

function numToString(num){
    let str = ""
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

function checkLogIn(){
    return sessionStorage.getItem("username") == null
}


logInButton.addEventListener('click', logIn);
backButtonBlackJack.addEventListener('click', () => {
    showDiv(mainPageDiv);})
backButtonRoulette.addEventListener('click', () => {showDiv(mainPageDiv);})
backCrapsButton.addEventListener('click', () => {showDiv(mainPageDiv);})
blackJackButton.addEventListener('click', () => {showDiv(blackJackDiv);})
rouletteButton.addEventListener('click', () => {showDiv(rouletteDiv);})
crapsButton.addEventListener('click', () => {showDiv(crapsDiv);})
