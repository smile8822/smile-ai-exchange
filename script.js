import { WEBHOOK_URL } from "./config.js";

// 📌 빗썸 API 환율 조회
async function fetchRate() {
  try {
    const res = await fetch("https://api.bithumb.com/public/ticker/USDT_KRW");
    const data = await res.json();
    const time = new Date().toLocaleString();
    return { rate: Number(data.data.closing_price), time };
  } catch (err) {
    alert("환율 조회 실패. 인터넷 연결 또는 API 점검을 확인하세요.");
    return null;
  }
}

// 📌 계산 함수
async function calculate() {
  const direction = document.getElementById("direction").value; // USDT→KRW 또는 KRW→USDT
  const amount = Number(document.getElementById("amount").value);

  if (!amount || amount <= 0) {
    alert("금액을 입력하세요.");
    return;
  }

  const data = await fetchRate();
  if (!data) return;
  const rate = data.rate;
  const feeRate = 0.01; // 수수료 1%

  // 환전 결과 계산
  let result;
  if (direction === "USDT→KRW") {
    result = amount * rate;
  } else {
    result = amount / rate;
  }

  const fee = result * feeRate;
  const realReceive = result - fee;

  // 📌 결과 표시
  document.getElementById("resultBox").innerHTML =
    `📌 기준: ${direction}<br>` +
    `💰 입력: ${amount} ${direction === "USDT→KRW" ? "USDT" : "KRW"}<br>` +
    `💱 환율: ${rate.toLocaleString()} KRW<br>` +
    `💸 환전 금액: ${Math.floor(result).toLocaleString()} KRW/USDT<br>` +
    `🧾 수수료(1%): ${Math.floor(fee).toLocaleString()}<br>` +
    `💎 수령액: ${Math.floor(realReceive).toLocaleString()} KRW/USDT<br>`;

  // 📌 n8n Webhook 기록 전송 (JSON)
  sendWebhook({
    timestamp: new Date().toISOString(),
    direction,
    amount,
    rate,
    fee: Math.floor(fee),
    realAmount: Math.floor(realReceive)
  });
}

// 📌 Webhook 데이터 전송 함수 (핵심!!)
async function sendWebhook(data) {
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    console.log("Webhook 전송 성공:", data);
  } catch (err) {
    console.log("Webhook 전송 실패:", err);
  }
}

// 📌 버튼 연결
document.getElementById("calcBtn").addEventListener("click", calculate);
