class LMStudioClient {
  constructor(baseURL = 'http://127.0.0.1:1234') {
    this.baseURL = baseURL;
  }

  async analyzeText(text, prompt = "Только одно предложение оценки рисков. Без объяснений. Формат: 'Степень угрозы [уровень] из-за [причина].'") {
    try {
      const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "local-model",
          messages: [
            {
              role: "system",
              content: "Ты даешь только финальную оценку рисков. Начинай сразу с 'Степень угрозы:' и давай одно законченное предложение. НИКАКИХ предисловий, объяснений или размышлений."
            },
            {
              role: "user",
              content: `${prompt}\n\n${text.substring(0, 4000)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.choices[0].message.content;
      
      responseText = responseText.replace(/<think>.*?<\/think>/gs, '');
      
      return responseText;
    } catch (error) {
      console.error('Error calling LM Studio:', error);
      throw error;
    }
  }

  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/v1/models`, {
        method: 'GET'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}