import './style.css';

// --- Utility Functions ---

const TextProcessUtils = {
  splitIntoSentences(content) {
    const latexPatterns = [/\\input{.*?}/g, /~\\ref{.*?}/g, /\\section{.*?}/g];
    for (let pattern of latexPatterns) {
      content = content.replace(pattern, '');
    }
    // Split by period but not by comma
    return content
      .split(/(?<!,)\./)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  },

  removeNewlines(input) {
    return input.replace(/\n/g, ' ').trim();
  },
};

const SentenceProcessUtils = {
  process(sentence, forbiddenWords) {
    let wordIndex = 1;
    let wordsWithHighlights = sentence.split(/\s+/).map((word) => {
      for (let forbidden of forbiddenWords) {
        if (word.toLowerCase().includes(forbidden)) {
          word = `<span class="highlight">${word}</span>`;
        }
      }
      if (
        !word.match(/^\[\d+(,\d+)*\]$/) &&
        !word.match(/,\d+$/) &&
        !word.match(/^\[\d+(,\d+)*\],\d+$/)
      ) {
        word += `<sup>${wordIndex}</sup>`;
        wordIndex++;
      }
      return word;
    });

    const cleaned = wordsWithHighlights.join(' ');
    let words = cleaned
      .split(/\s+/)
      .filter(
        (word) =>
          !word.match(/<sup>\(\d+\)<\/sup>/) &&
          !word.match(/^\[\d+(,\d+)*\]$/) &&
          !word.match(/,\d+$/) &&
          !word.match(/^\[\d+(,\d+)*\],\d+$/)
      );

    if (words.length === 0) {
      return null;
    }

    return {
      cleaned,
      words,
    };
  },
};

// --- Core Logic ---

function processContent(content, forbiddenWords) {
  let sentences = TextProcessUtils.splitIntoSentences(content);
  sentences = sentences.map(TextProcessUtils.removeNewlines);

  console.log('sentences:', sentences);

  const processed = sentences
    .map((sentence) => SentenceProcessUtils.process(sentence, forbiddenWords))
    .filter(Boolean);

  processed.sort((a, b) => b.words.length - a.words.length);

  console.log(processed);
  return processed;
}

function displayProcessedContent() {
  const texContent = document.getElementById('texInput').value;
  const forbiddenWords = document
    .getElementById('bannedWordsInput')
    .value.split(',');
  const processedSentences = processContent(texContent, forbiddenWords);

  const filteredSentences = processedSentences.filter((item) => {
    return (
      item.words.length >= 30 ||
      item.cleaned.includes('<span class="highlight">')
    );
  });

  const statsDiv = document.getElementById('stats');
  statsDiv.innerHTML = '';
  for (let item of filteredSentences) {
    const div = document.createElement('div');
    div.classList.add('badSentence');
    div.innerHTML = `${item.cleaned}<br><br>`;
    statsDiv.appendChild(div);
  }
}

// --- Event Listeners ---

document
  .getElementById('texInput')
  .addEventListener('input', displayProcessedContent);
document
  .getElementById('bannedWordsInput')
  .addEventListener('input', displayProcessedContent);

// Start by reading default value from the textbox for the text and then process it
displayProcessedContent();
