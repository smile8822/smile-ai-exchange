async function sendCalc() {
  const direction = document.getElementById("direction").value;
  const amount = Number(document.getElementById("amount").value);
  const resultEl = document.getElementById("result");

  if (!amount || amount <= 0) {
    resultEl.textContent = "⚠️ 금액을 올바르게 입력해주세요.";
    return;
  }

  resultEl.textContent = "⏳ n8n 서버에 요청 중...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction, amount }),
    });

    if (!res.ok) {
      const text = await res.text();
      resultEl.textContent =
        "❌ 서버 응답 오류\nStatus: " + res.status + "\n" + text;
      return;
    }

    const data = await res.json();

    // 보기 좋게 한글 텍스트로 포맷
    let text = "";
    if (direction === "USDT_TO_KRW") {
      text += `방향: USDT → KRW\n`;
      text += `기준가: ${data.price} KRW/USDT\n`;
      text += `입력 USDT: ${data.input_usdt} USDT\n`;
      text += `수령 KRW (1% 수수료 적용): ${Number(
        data.output_krw
      ).toLocaleString()} 원\n`;
    } else {
      text += `방향: KRW → USDT\n`;
      text += `기준가: ${data.price} KRW/USDT\n`;
      text += `입력 KRW: ${Number(data.input_krw).toLocaleString()} 원\n`;
      text += `수령 USDT (1% 수수료 적용): ${data.output_usdt} USDT\n`;
    }

    resultEl.textContent = text;
  } catch (e) {
    resultEl.textContent = "🚨 요청 중 에러 발생: " + e;
  }
}
