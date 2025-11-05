const analyz = document.getElementById("analyz");
const analyzeWithAI = document.getElementById("analyzeWithAI");
const result = document.getElementById("result");

const lmStudio = new LMStudioClient();
document.getElementById('openOptions').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    });
analyz.addEventListener("click", async () => {
  result.textContent = "Анализирую...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "analyze_page" }, (response) => {
    if (chrome.runtime.lastError) {
      result.textContent = "Ошибка: " + chrome.runtime.lastError.message;
    } else if (!response) {
      result.textContent = "Контентный скрипт не ответил";
    } else {
      result.textContent = response.text;
    }
  });
});

analyzeWithAI.addEventListener("click", async () => {
  result.textContent = "Проверяю подключение к LM Studio...";

  // Проверяем подключение к LM Studio
  const isConnected = await lmStudio.checkConnection();
  if (!isConnected) {
    result.textContent = "❌ LM Studio не запущен или недоступен\n\nУбедитесь, что:\n1. LM Studio запущен\n2. Модель загружена\n3. Сервер работает";
    return;
  }

  result.textContent = "Нахожу пользовательское соглашение...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "analyze_page" }, async (response) => {
    if (chrome.runtime.lastError) {
      result.textContent = "Ошибка: " + chrome.runtime.lastError.message;
    } else if (!response) {
      result.textContent = "Контентный скрипт не ответил";
    } else {
      if (response.text.includes("не найдена")) {
        result.textContent = response.text;
        return;
      }

      try {
        result.textContent = "Анализирую с помощью AI...";
        
        // Извлекаем текст из ответа
        const textMatch = response.text.match(/Фрагмент текста:\n(.+)/s);
        if (textMatch) {
          const agreementText = textMatch[1];
          const analysis = await lmStudio.analyzeText(agreementText);
          
          result.textContent = `✅ Анализ завершен\n\nСсылка: ${response.text.split('\n')[2]}\n\nAI Анализ:\n${analysis}`;
        } else {
          result.textContent = "Не удалось извлечь текст для анализа";
        }
      } catch (error) {
        result.textContent = `Ошибка AI анализа: ${error.message}\n\nУбедитесь, что LM Studio запущен с моделью.`;
      }
    }
  });
});