import Kikey from "./kikey";
import "/style.css";

function $(selectors) {
  return document.querySelector(selectors);
}

// Using ES6 import syntax
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/atom-one-dark.css";

// Then register the languages you need
hljs.registerLanguage("javascript", javascript);
hljs.highlightAll();

const kikey = Kikey();

let started = false;
document.getElementById("start").addEventListener("click", () => {
  if (!started) {
    started = true;
    kikey.startRecord();
  } else {
    started = false;
    const sequence = kikey.stopRecord();
    document.getElementById("app").innerHTML = sequence
      .split(" ")
      .map((v) => `<kbd>${v}</kbd>`)
      .join("");
  }
});

function typeGettingStarted() {
  kikey.off(typeGettingStarted); // Remove event handler
  let count = 1;
  const id = setInterval(() => {
    $("#getting-started").textContent = "Getting Started!".slice(0, count++);
    if ($("#getting-started").textContent == "Getting Started!") {
      clearInterval(id);
    }
  }, 100);
}
kikey.on("g", typeGettingStarted);

kikey.on("C-A-u", () => {
  $("#letter-M").classList.toggle('rotate'); // Start or stop the animation
});


// Listen to key `Ctrl+Alt+U`
kikey.on("S-s e q", () => {

  $("#letter-M").classList.toggle('rotate');
});
