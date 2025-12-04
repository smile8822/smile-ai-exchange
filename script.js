import { WEBHOOK_URL } from "./config.js";

// 기본 가격 API 호출 (빗썸기준)
async function getPrice() {
    const res = await fetch('https://api.bithumb.com/public/ticker/USDT_KRW');
    const data = await res.json();
    return Number(data.data.closing_price);
}

// 계산 + UI 표시 + 웹훅 전송
async function calculate() {
    const direction = document.getElementById("direction").value;
    const amount = Number(document.getElementById("amount").value);

    if (!amount || amount <= 0) {
        alert("올바른 금액을 입력하세요.");
        return;
    }

    // 1. 실시간 환율 가져오기
    const rate = await getPrice();
    let result = 0;
    let fee = 0;

    if (direction === "USDT→KRW") {
        result = amount * rate;
    } else {
        result = amount / rate;
    }

    // 2. 1% 수수료
    fee = result * 0.01;
    const realReceive = result - fee;

    // 3. 결과 UI 표시
    document.getElementById("resultBox").innerHTML = `
    🔁 환전 방향: <b>${direction}</b><br>
    💰 입력 금액: <b>${amount.toLocaleString()}</b><br>
    💱 적용 환율: <b>${rate.toLocaleString()} KRW/USDT</b><br>
    💸 수수료(1%): <b>${Math.floor(fee).toLocaleString()}</b><br>
    📌 실제 지급 금액: <b>${Math.floor(realReceive).toLocaleString()}</b><br>
    `;

    // 4. n8n Webhook으로 데이터 전송 (Google Sheet 자동 기록)
    sendToWebhook({
        direction,
        amount,
        rate,
        fee: Math.floor(fee),
        realAmount: Math.floor(realReceive)
    });
}

// n8n 전송 함수
async function sendToWebhook(data) {
    try {
        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        console.log("Webhook sent:", data);
    } catch (e) {
        console.log("Webhook Error:", e);
    }
}

// 버튼 이벤트 연결
document.getElementById("calcBtn").addEventListener("click", calculate);
