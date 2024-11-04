window.onload = () => document.getElementById('code-editor').focus();

const keywords = ['תניא', 'בעא_מיניה', 'אמר_ליה', 'אין', 'לא', 'הדרן_עלך', 'אי_נמי', 'אידך', 'אי'];

let selectedAutocompleteIndex = 0;

function lineNumbers(textarea) {
  const linesCount = textarea.value.split('\n').length;
  document.getElementById('line-numbers').innerHTML = [...Array(linesCount).keys()].map(x => x + 1).join('<br>');

  const caretPosition = textarea.selectionStart;
  textarea.value = textarea.value.replace(/\+/g, '﬩');
  textarea.setSelectionRange(caretPosition, caretPosition);

  autoResize(textarea);
  updateHighlight(textarea.value);
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.max(textarea.scrollHeight, window.innerHeight - 20) + 'px';
}

function updateHighlight(text) {
  let escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  escapedText = escapedText.replace(/"(.*?)"/g, '<span class="string">"$1"</span>');
  escapedText = escapedText.replace(/(?<![א-תa-zA-Z0-9"])(\d+)(?![א-תa-zA-Z0-9"])/g, '<span class="number">$1</span>');
  escapedText = escapedText.replace(new RegExp(`(${keywords.join('|')})`, 'g'), '<span class="keyword">$1</span>');
  document.getElementById("highlight").innerHTML = escapedText.replace(/\n/g, '<br>');
}

function syncScroll(textarea) {
  const highlight = document.getElementById("highlight");
  highlight.scrollTop = textarea.scrollTop;
  highlight.scrollLeft = textarea.scrollLeft;
}

function autoComplete(textarea) {
  const inputText = textarea.value.substring(0, textarea.selectionStart);
  const lastWord = inputText.split(/\s+/).pop();
  const autocompleteList = document.getElementById("autocomplete-list");

  if (lastWord.length > 0) {
    const matches = keywords.filter(keyword => keyword.startsWith(lastWord));
    if (matches.length > 0) {
      autocompleteList.innerHTML = matches.map((match, index) => `<div class="autocomplete-item${index === selectedAutocompleteIndex ? ' selected' : ''}" onclick="insertAutocomplete('${match}')">${match}</div>`).join('');
      const rect = textarea.getBoundingClientRect();
      const caretPosition = textarea.selectionStart;
      const lines = textarea.value.substr(0, caretPosition).split("\n");
      const top = rect.top + lines.length * 24 - 10;
      const left = rect.left + lines[lines.length - 1].length * 8;
      autocompleteList.style.top = `${top}px`;
      autocompleteList.style.right = `${left}px`;
      autocompleteList.style.display = "block";
    } else {
      autocompleteList.style.display = "none";
    }
  } else {
    autocompleteList.style.display = "none";
  }
}

function insertAutocomplete(word) {
  const textarea = document.getElementById("code-editor");
  const start = textarea.selectionStart - textarea.value.split(/\s+/).pop().length;
  const end = textarea.selectionStart;

  textarea.setRangeText(word, start, end, "end");
  lineNumbers(textarea);
  document.getElementById("autocomplete-list").style.display = "none";
  textarea.focus();
  selectedAutocompleteIndex = 0;
}

function handleTabCompletion(e) {
  const autocompleteList = document.getElementById("autocomplete-list");

  if (e.key === "Enter" || e.key === "Tab") {
    if (autocompleteList.style.display === "block") {
      e.preventDefault();
      insertAutocomplete(autocompleteList.children[selectedAutocompleteIndex >= 0 ? selectedAutocompleteIndex : 0].textContent);
    }
  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    if (autocompleteList.style.display === "block") {
      e.preventDefault();
      if (e.key === "ArrowDown") {
        selectedAutocompleteIndex = (selectedAutocompleteIndex + 1) % autocompleteList.children.length;
      } else if (e.key === "ArrowUp") {
        selectedAutocompleteIndex = (selectedAutocompleteIndex - 1 + autocompleteList.children.length) % autocompleteList.children.length;
      }
      updateAutocompleteSelection();
    }
  } else if (e.key === "Escape") {
    autocompleteList.style.display = "none";
  }
}

function updateAutocompleteSelection() {
  const autocompleteList = document.getElementById("autocomplete-list");
  for (let i = 0; i < autocompleteList.children.length; i++) {
    autocompleteList.children[i].classList.toggle("selected", i === selectedAutocompleteIndex);
  }
}

function autoClose(e, textarea) {
  const openCloseMap = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"'
  };
  
  const openChar = e.key;
  if (openCloseMap[openChar]) {
    e.preventDefault();
    const closeChar = openCloseMap[openChar];
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    textarea.setRangeText(openChar + closeChar, start, end, 'end');
    textarea.setSelectionRange(start + 1, start + 1);

    lineNumbers(textarea);
  }
}