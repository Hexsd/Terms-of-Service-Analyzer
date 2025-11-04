chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyze_page") {
    const links = Array.from(document.querySelectorAll("a"));
    const patterns = [
      "пользовательское соглашение",
      "пользовательским соглашением",
      "политика конфиденциальности",
      "terms of service",
      "условия использования",
      "Privacy policy"
    ];

    let foundLink = null;
    for (const link of links) {
      const text = link.innerText.toLowerCase();
      if (patterns.some(p => text.includes(p))) {
        foundLink = link.href;
        break;
      }
    }

    if (!foundLink) {
      sendResponse({ text: "Ссылка на пользовательское соглашение не найдена ❌" });
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("GET", foundLink, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const html = xhr.responseText;
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          
          const scripts = doc.querySelectorAll('script, style, noscript');
          scripts.forEach(el => el.remove());
          
          let text = doc.body.innerText || "";
          
          text = text.replace(/\s+/g, ' ').trim();
          const preview = text;
          
          sendResponse({
            text: "Нашёл ссылку ✅\n\nURL: " + foundLink + "\n\nФрагмент текста:\n" + preview
          });
        } else {
          sendResponse({ text: "Ошибка при загрузке: " + xhr.status });
        }
      }
    };
    xhr.send();
    return true;
  }
});
