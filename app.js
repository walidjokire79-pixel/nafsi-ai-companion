const STORAGE_KEY = 'nafsi-chat-history';
const SETTINGS_KEY = 'nafsi-settings';

const chatEl = document.getElementById('chat');
const composer = document.getElementById('composer');
const messageInput = document.getElementById('messageInput');
const voiceInputBtn = document.getElementById('voiceInputBtn');
const voiceSelect = document.getElementById('voiceSelect');
const rateRange = document.getElementById('rateRange');
const pitchRange = document.getElementById('pitchRange');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const speakBtn = document.getElementById('speakBtn');
const installBtn = document.getElementById('installBtn');

let recognition;
let deferredPrompt;
let selectedVoice = null;

const demoReplies = [
  'Salam, khoya. NAFSI AI hna, ana m3ak. Chno bghiti n3awnk bzzaf? 💛',
  'M3a sba, ghadi n7awel nkhadem 3la had l9iss. 3ndek 7aja 9a3da? 🤍',
  'Ana m3ak, bghiti ndir lik plan, smiya, wala 7aja 3la l7ayt? ✨',
  'Darija: "M3a s7a, bghiti n3awnk, khassna n9ra 7aja 3la l7aja li 3ndek."',
  'Safi, 3ndek 7aja 9a3da? Ana m3a l7al. 🌙',
  'Hna, ghadi nrawwj fik idée, bghiti n9der ndir lik checklist? 🏺',
  'M3a sba, chno kayn? N9dar n3awnk b7al lmorah? 🇲🇦'
];

function getDefaultSettings() {
  return {
    rate: 1,
    pitch: 1,
    selectedVoiceName: '',
  };
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...getDefaultSettings(), ...saved };
  } catch (error) {
    return getDefaultSettings();
  }
}

function saveSettings() {
  const settings = {
    rate: Number(rateRange.value),
    pitch: Number(pitchRange.value),
    selectedVoiceName: selectedVoice ? selectedVoice.name : '',
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveMessages(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function appendMessage(role, text) {
  const messages = loadMessages();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  messages.push({ role, text, time });
  saveMessages(messages);
  renderMessages();
}

function renderMessages() {
  const messages = loadMessages();
  chatEl.innerHTML = '';

  if (!messages.length) {
    const welcome = document.createElement('div');
    welcome.className = 'message assistant';
    welcome.innerHTML = `
      <div class="bubble">
        Salam! Ana NAFSI AI, companion Mn Morocco. Hna 3ndna demo mode, bzaaf li ghadi t7taj. 3ndek 7aja? 
        <span class="message-meta">Demo mode • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    `;
    chatEl.appendChild(welcome);
    return;
  }

  messages.forEach((message) => {
    const item = document.createElement('div');
    item.className = `message ${message.role}`;

    item.innerHTML = `
      <div class="bubble">
        ${escapeHtml(message.text)}
        <span class="message-meta">${message.role === 'user' ? 'You' : 'NAFSI AI'} • ${message.time}</span>
      </div>
    `;

    chatEl.appendChild(item);
  });

  chatEl.scrollTop = chatEl.scrollHeight;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateReply(userText) {
  const text = (userText || '').trim();

  if (!text) {
    return '3ndek 7aja b7al? Khassna n9ra l7aja li bghiti.';
  }

  const lowered = text.toLowerCase();

  if (lowered.includes('salam') || lowered.includes('salam')) {
    return 'Salam 👋. Ana m3ak, 3ndek 7aja b7al?';
  }

  if (lowered.includes('bonjour') || lowered.includes('salut')) {
    return 'Bonjour! Ana m3ak, ghadi ndir lik support bss. 💛';
  }

  if (lowered.includes('maroc') || lowered.includes('morocco')) {
    return 'Morocco is beautiful, and NAFSI AI is made for that warm vibe. 3ndek 7aja lik?';
  }

  if (lowered.includes('help') || lowered.includes('aide') || lowered.includes('3awn')) {
    return 'M3a sba, ghadi n3awnk. 9dar tktb 7aja 9a3da, w ana n7awel n9dar n3awnk b7al l7al.';
  }

  const randomReply = demoReplies[Math.floor(Math.random() * demoReplies.length)];
  return randomReply;
}

function sendMessage(rawText) {
  const text = (rawText || '').trim();
  if (!text) return;

  appendMessage('user', text);
  const reply = generateReply(text);

  setTimeout(() => {
    appendMessage('assistant', reply);
    speakReply(reply);
  }, 280);

  messageInput.value = '';
  messageInput.style.height = 'auto';
}

composer.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage(messageInput.value);
});

messageInput.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 140)}px`;
});

clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  renderMessages();
});

function populateVoices() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  voiceSelect.innerHTML = '';

  voices.forEach((voice) => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  const settings = loadSettings();
  const savedVoice = voices.find((voice) => voice.name === settings.selectedVoiceName);
  selectedVoice = savedVoice || voices[0] || null;

  if (selectedVoice) {
    voiceSelect.value = selectedVoice.name;
  }
}

function applyVoiceSettings() {
  const settings = loadSettings();
  rateRange.value = settings.rate;
  pitchRange.value = settings.pitch;

  if (selectedVoice) {
    voiceSelect.value = selectedVoice.name;
  }
}

function useSelectedVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  selectedVoice = voices.find((voice) => voice.name === voiceSelect.value) || voices[0] || null;
  saveSettings();
}

function speakReply(text) {
  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const settings = loadSettings();

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.rate = Number(settings.rate || 1);
  utterance.pitch = Number(settings.pitch || 1);
  utterance.lang = 'fr-FR';

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

speakBtn.addEventListener('click', () => {
  const latest = loadMessages().slice(-1)[0];
  if (latest && latest.role === 'assistant') {
    speakReply(latest.text);
  }
});

voiceSelect.addEventListener('change', () => {
  useSelectedVoice();
});

rateRange.addEventListener('input', () => {
  saveSettings();
});

pitchRange.addEventListener('input', () => {
  saveSettings();
});

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = populateVoices;
  populateVoices();
}

applyVoiceSettings();
renderMessages();

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    voiceInputBtn.title = 'Speech recognition unavailable in this browser';
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'fr-FR';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    messageInput.value = transcript;
    sendMessage(transcript);
  };

  recognition.onerror = () => {
    voiceInputBtn.classList.remove('is-listening');
  };

  recognition.onend = () => {
    voiceInputBtn.classList.remove('is-listening');
  };
}

voiceInputBtn.addEventListener('click', () => {
  if (!recognition) {
    setupSpeechRecognition();
  }

  if (!recognition) {
    alert('La reconnaissance vocale n\'est pas disponible dans ce navigateur.');
    return;
  }

  voiceInputBtn.classList.toggle('is-listening');
  const isListening = voiceInputBtn.classList.contains('is-listening');

  if (isListening) {
    recognition.start();
  } else {
    recognition.stop();
  }
});

setupSpeechRecognition();

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add('hidden');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      console.warn('Service worker registration failed');
    });
  });
}
