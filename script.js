// --- INITIAL SETUP ---
let balance = parseFloat(localStorage.getItem("casinoBalance")) || 20000;
let lastVisit = localStorage.getItem("lastVisitDate");
let today = new Date().toDateString();

if (lastVisit !== today) {
    balance += (balance * 0.1) + 1500;
    localStorage.setItem("lastVisitDate", today);
    saveState();
    alert("Daily Bonus! $1500 added + 10% Interest gained.");
}

function saveState() {
    localStorage.setItem("casinoBalance", balance);
    const display = document.getElementById("balance-display");
    display.innerText = "Balance: $" + Math.floor(balance).toLocaleString();
    display.style.color = balance < 0 ? "#ff4d4d" : "#00ff00";
}
saveState();

// --- ROULETTE LOGIC ---
document.getElementById("spinButton").addEventListener("click", () => {
    const nBet = parseFloat(document.getElementById("numberBet").value) || 0;
    const eoBet = parseFloat(document.getElementById("evenBet").value) || 0;
    const cBet = parseFloat(document.getElementById("colorBet").value) || 0;
    const totalBet = nBet + eoBet + cBet;

    if (totalBet - 10000 > balance) return alert("Over debt limit!");
    balance -= totalBet;

    const result = Math.floor(Math.random() * 38); // 37 = 00
    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    let color = (result === 0 || result === 37) ? "Green" : (redNumbers.includes(result) ? "Red" : "Black");
    
    let win = 0;
    const pNum = document.getElementById("numberInput").value;
    if ((pNum === "00" && result === 37) || (parseInt(pNum) === result)) win += nBet * 36;
    
    if (result !== 0 && result !== 37) {
        let isEven = result % 2 === 0;
        let eoChoice = document.getElementById("evenInput").value;
        if ((isEven && eoChoice === "Even") || (!isEven && eoChoice === "Odd")) win += eoBet * 2;
    }
    if (document.getElementById("colorInput").value === color) win += cBet * 2;

    balance += win;
    document.getElementById("rouletteOutput").innerHTML = `Landed: <b>${color} ${result === 37 ? '00' : result}</b><br>Won: $${win}`;
    saveState();
});

// --- BLACKJACK LOGIC ---
let deck = [], pHand = [], dHand = [], currentBjBet = 0;

function createDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
    const values = [{n:"A", v:11}, {n:"2", v:2}, {n:"3", v:3}, {n:"4", v:4}, {n:"5", v:5}, {n:"6", v:6}, {n:"7", v:7}, {n:"8", v:8}, {n:"9", v:9}, {n:"10", v:10}, {n:"J", v:10}, {n:"Q", v:10}, {n:"K", v:10}];
    deck = [];
    for (let s of suits) for (let v of values) deck.push({ name: v.n + s, value: v.v });
    deck.sort(() => Math.random() - 0.5);
}

function getScore(hand) {
    let s = 0, a = 0;
    for (let c of hand) { s += c.value; if(c.name.includes("A")) a++; }
    while (s > 21 && a > 0) { s -= 10; a--; }
    return s;
}

document.getElementById("dealBtn").addEventListener("click", () => {
    currentBjBet = parseFloat(document.getElementById("bjBet").value) || 0;
    if (currentBjBet - 10000 > balance) return alert("Debt limit!");
    if (currentBjBet <= 0) return alert("Enter bet!");

    balance -= currentBjBet;
    createDeck();
    pHand = [deck.pop(), deck.pop()];
    dHand = [deck.pop(), deck.pop()];
    
    updateBjUI(false);
    document.getElementById("dealBtn").disabled = true;
    document.getElementById("hitBtn").disabled = false;
    document.getElementById("stayBtn").disabled = false;
    document.getElementById("blackjackOutput").innerText = "Hit or Stay?";
    saveState();
});

document.getElementById("hitBtn").addEventListener("click", () => {
    pHand.push(deck.pop());
    updateBjUI(false);
    if (getScore(pHand) > 21) {
        document.getElementById("blackjackOutput").innerText = "Bust! Dealer Wins.";
        endBj();
    }
});

document.getElementById("stayBtn").addEventListener("click", () => {
    while (getScore(dHand) < 17) dHand.push(deck.pop());
    updateBjUI(true);
    let pS = getScore(pHand), dS = getScore(dHand);
    if (dS > 21 || pS > dS) {
        balance += currentBjBet * 2;
        document.getElementById("blackjackOutput").innerText = "You Win!";
    } else if (pS === dS) {
        balance += currentBjBet;
        document.getElementById("blackjackOutput").innerText = "Push (Tie).";
    } else {
        document.getElementById("blackjackOutput").innerText = "Dealer Wins.";
    }
    endBj();
});

function updateBjUI(show) {
    document.getElementById("player-hand").innerText = "Player: " + pHand.map(c=>c.name).join(", ") + " ("+getScore(pHand)+")";
    document.getElementById("dealer-hand").innerText = "Dealer: " + (show ? dHand.map(c=>c.name).join(", ") + " ("+getScore(dHand)+")" : dHand[0].name + ", [Hidden]");
}

function endBj() {
    document.getElementById("dealBtn").disabled = false;
    document.getElementById("hitBtn").disabled = true;
    document.getElementById("stayBtn").disabled = true;
    saveState();
}
