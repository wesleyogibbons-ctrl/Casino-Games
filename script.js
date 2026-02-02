// --- 1. INITIAL SETUP & BALANCE ---
let balance = parseFloat(localStorage.getItem("casinoBalance")) || 20000;
let lastVisit = localStorage.getItem("lastVisitDate");
let today = new Date().toDateString();

// Daily Bonus: $1500 + 10% Interest
if (lastVisit !== today) {
    const interest = balance * 0.10;
    balance += interest + 1500;
    localStorage.setItem("lastVisitDate", today);
    alert(`Welcome back! You earned $1,500 + $${Math.floor(interest).toLocaleString()} in interest.`);
}

function saveState() {
    localStorage.setItem("casinoBalance", balance);
    const display = document.getElementById("balance-display");
    if (display) {
        display.innerText = "Balance: $" + Math.floor(balance).toLocaleString();
        display.style.color = balance < 0 ? "#ff4d4d" : "#00ff00";
    }
}

// --- 2. HISTORY SYSTEM ---
function addHistory(game, result, netAmount) {
    const log = document.getElementById("history-log");
    if (!log) return;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const color = netAmount > 0 ? "#00ff00" : (netAmount < 0 ? "#ff4d4d" : "#ffffff");
    const sign = netAmount > 0 ? "+" : "";
    
    const entry = `<p style="border-bottom: 1px solid #222; margin: 5px 0; padding-bottom: 5px;">
        [${time}] <b>${game}:</b> ${result} | 
        <span style="color: ${color}">${sign}$${netAmount.toLocaleString()}</span>
    </p>`;
    
    log.innerHTML = entry + log.innerHTML;

    // Keep only the last 15 entries
    if (log.children.length > 15) {
        log.removeChild(log.lastChild);
    }
}

// --- 3. ROULETTE LOGIC ---
document.getElementById("spinButton").addEventListener("click", () => {
    const nBet = parseFloat(document.getElementById("numberBet").value) || 0;
    const eoBet = parseFloat(document.getElementById("evenBet").value) || 0;
    const cBet = parseFloat(document.getElementById("colorBet").value) || 0;
    const totalBet = nBet + eoBet + cBet;

    if (totalBet <= 0) return alert("Please enter a bet!");
    if (totalBet - 10000 > balance) return alert("You can only go $10,000 into debt!");
    
    balance -= totalBet;

    const result = Math.floor(Math.random() * 38); // 37 represents "00"
    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    let color = (result === 0 || result === 37) ? "Green" : (redNumbers.includes(result) ? "Red" : "Black");
    
    let win = 0;
    const pNumInput = document.getElementById("numberInput").value;

    // A. Single Number Win (Includes 0 and 00)
    if ((pNumInput === "00" && result === 37) || (parseInt(pNumInput) === result)) {
        win += nBet * 36;
    }
    
    // B. Outside Bets (Even/Odd and Red/Black) - ONLY win if NOT Green
    if (result !== 0 && result !== 37) {
        // Even/Odd
        const isEven = result % 2 === 0;
        const eoChoice = document.getElementById("evenInput").value;
        if ((isEven && eoChoice === "Even") || (!isEven && eoChoice === "Odd")) {
            win += eoBet * 2;
        }
        // Color
        if (document.getElementById("colorInput").value === color) {
            win += cBet * 2;
        }
    }

    balance += win;
    const historyRes = `${color} ${result === 37 ? '00' : result}`;
    addHistory("Roulette", historyRes, win - totalBet);
    document.getElementById("rouletteOutput").innerHTML = `Landed: <b style="color:${color === 'Red' ? '#ff4d4d' : (color === 'Green' ? '#00ff00' : '#fff')}">${historyRes}</b><br>Won: $${win}`;
    saveState();
});

// --- 4. BLACKJACK LOGIC ---
let deck = [], pHand = [], dHand = [], currentBjBet = 0;

function createDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
    const values = [
        {n:"A", v:11}, {n:"2", v:2}, {n:"3", v:3}, {n:"4", v:4}, {n:"5", v:5}, 
        {n:"6", v:6}, {n:"7", v:7}, {n:"8", v:8}, {n:"9", v:9}, {n:"10", v:10}, 
        {n:"J", v:10}, {n:"Q", v:10}, {n:"K", v:10}
    ];
    deck = [];
