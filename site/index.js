import Kikey from "../src/index";
import "./style.css";

function $(selectors) {
  return document.querySelector(selectors);
}

const kikey = Kikey();
// Expose kikey to let guests play with it.
window.kikey = kikey;

kikey.on("g", typeGettingStarted);
function typeGettingStarted() {
  kikey.off(typeGettingStarted); // Remove event handler
  $("#getting-started").removeAttribute("data-tooltip");
  let count = 1;
  const id = setInterval(() => {
    $("#getting-started").textContent = "Getting Started!".slice(0, count++);
    if ($("#getting-started").textContent == "Getting Started!") {
      clearInterval(id);
    }
  }, 100);
}

kikey.on("C-A-u", () => {
  $("#letter-M").classList.toggle("rotate"); // Start or stop the animation
});

function celebrate() {
  const span = document.createElement("span");
  span.textContent = "→🎉";
  $("#level3").insertAdjacentElement("afterend", span);
}

// Listen to key `Shift + S then E then Q`
kikey.on(
  "S-s e q",
  function onComplete() {
    celebrate(); // Append with 🎉
  },
  // Optioal argument
  function onComboChange(level) {
    if (level == 0) {
      // Sequence broke
      $("#level1").classList.remove("bright");
      $("#level2").classList.remove("bright");
      $("#level3").classList.remove("bright");
    } else {
      // Turn on bright for corresbonding level of key binding
      $("#level" + level).classList.add("bright");
    }
  },
);

let started = false;
$("#record-btn").addEventListener("click", () => {
  if (!started) {
    started = true;
    $("#record-btn").textContent = "⏹ Stop Recording";
    $("#record-result").textContent = "Listening to your keyboard...";
    kikey.startRecord();
  } else {
    started = false;
    $("#record-btn").textContent = "⏵ Start Recording";
    $("#record-result").textContent = kikey.stopRecord();
  }
});
