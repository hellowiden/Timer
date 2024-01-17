const MAX_HOURS = 99;
const MAX_MINUTES_SECONDS = 60;
const SECONDS_IN_MINUTE = 60;
const MILLISECONDS_IN_SECOND = 1000;

function CountdownTimer() {
  const timer = document.getElementById("timer");
  const displayElements = Object.fromEntries(
    ["hours", "minutes", "seconds"].map((unit) => [
      unit,
      timer.querySelector(
        `#display${unit.charAt(0).toUpperCase() + unit.slice(1)}`
      )
    ])
  );
  let countdownInterval = null;
  let isRunning = false;
  let presetMinutes = 0;

  const startButton = document.getElementById("startButton");
  const resetButton = document.getElementById("resetButton");
  const presetButtonsContainer = document.querySelector(
    ".preset-buttons-container"
  );
  const presetButtons = [
    ...presetButtonsContainer.querySelectorAll(".preset-button")
  ];

  const timeline = document.getElementById("timeline");
  const timelineActiveClass = "active";

  const overlay = document.getElementById("countdownOverlay");

  function attachEventListeners() {
    presetButtonsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("preset-button")) {
        const minutes = parseInt(e.target.getAttribute("data-minutes"));
        setCountdownTime(minutes);
        activatePresetButton(e.target);
      }
    });

    startButton.addEventListener("click", () => {
      if (!validateInput() || isRunning) return;
      startCountdown();
    });

    resetButton.addEventListener("click", () => {
      resetCountdown();
    });

    Object.values(displayElements).forEach(makeEditable);

    overlay.addEventListener("click", () => {
      hideCountdownOverlay();
    });
  }

  function setCountdownTime(minutes) {
    presetMinutes = minutes;
    const { hours, minutes: displayMinutes, seconds } = displayElements;
    const totalSeconds = minutes * SECONDS_IN_MINUTE;
    hours.textContent = padZero(
      Math.floor(totalSeconds / (SECONDS_IN_MINUTE * SECONDS_IN_MINUTE))
    );
    displayMinutes.textContent = padZero(
      Math.floor(
        (totalSeconds % (SECONDS_IN_MINUTE * SECONDS_IN_MINUTE)) /
          SECONDS_IN_MINUTE
      )
    );
    seconds.textContent = padZero(totalSeconds % SECONDS_IN_MINUTE);
  }

  function validateInput() {
    const { hours, minutes, seconds } = displayElements;
    const [h, m, s] = [hours, minutes, seconds].map((el) =>
      parseInt(el.textContent)
    );
    const isValid =
      Number.isInteger(h) &&
      Number.isInteger(m) &&
      Number.isInteger(s) &&
      h >= 0 &&
      m >= 0 &&
      s >= 0 &&
      h <= MAX_HOURS &&
      m < MAX_MINUTES_SECONDS &&
      s < MAX_MINUTES_SECONDS;
    if (!isValid) {
      showError("Please enter valid numbers for hours, minutes, and seconds.");
    }
    return isValid;
  }

  function showError(message) {
    const errorElement = document.createElement("div");
    errorElement.classList.add("error-message");
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    setTimeout(() => {
      errorElement.remove();
    }, 3000);
  }

  function updateButtonUI() {
    startButton.innerHTML = `<i class="fas fa-play"></i> ${
      isRunning ? "Countdown Active" : "Start Countdown"
    }`;
  }

  function startCountdown() {
    isRunning = true;
    updateButtonUI();

    countdownInterval = setInterval(() => {
      const { hours, minutes, seconds } = displayElements;
      const [h, m, s] = [hours, minutes, seconds].map((el) =>
        parseInt(el.textContent)
      );

      if (h === 0 && m === 0 && s === 0) {
        clearInterval(countdownInterval);
        isRunning = false;
        updateButtonUI();
        showCountdownOverlay();
      } else {
        if (s === 0) {
          seconds.textContent = MAX_MINUTES_SECONDS - 1;
          if (m === 0) {
            minutes.textContent = MAX_MINUTES_SECONDS - 1;
            hours.textContent = padZero(h - 1);
          } else {
            minutes.textContent = padZero(m - 1);
          }
        } else {
          seconds.textContent = padZero(s - 1);
        }

        const totalSeconds =
          h * SECONDS_IN_MINUTE * SECONDS_IN_MINUTE + m * SECONDS_IN_MINUTE + s;
        const initialSeconds = presetMinutes * SECONDS_IN_MINUTE;
        const progress = 1 - totalSeconds / initialSeconds;
        updateTimeline(progress);
      }
    }, MILLISECONDS_IN_SECOND);
  }

  function resetCountdown() {
    clearInterval(countdownInterval);
    isRunning = false;
    updateButtonUI();
    setCountdownTime(1);
    clearErrors();

    // Deactivate preset buttons by removing the "active" class
    presetButtons.forEach((btn) => btn.classList.remove("active"));

    hideCountdownOverlay();
  }

  function padZero(number) {
    return number.toString().padStart(2, "0");
  }

  function makeEditable(displayElement) {
    displayElement.contentEditable = true;
    displayElement.addEventListener("input", () => {
      let newValue = parseInt(displayElement.textContent.trim());
      newValue = isNaN(newValue)
        ? 0
        : Math.min(
            newValue,
            displayElement === displayElements.hours
              ? MAX_HOURS
              : MAX_MINUTES_SECONDS - 1
          );
      displayElement.textContent = padZero(newValue);
    });
    displayElement.addEventListener("blur", () => {
      displayElement.textContent = padZero(
        parseInt(displayElement.textContent)
      );
      displayElement.contentEditable = false;
    });
  }

  function activatePresetButton(button) {
    presetButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
  }

  function clearErrors() {
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach((element) => {
      element.remove();
    });
  }

  function showCountdownOverlay() {
    overlay.style.display = "flex";
  }

  function hideCountdownOverlay() {
    overlay.style.display = "none";
  }

  function updateTimeline(progress) {
    timeline.style.width = `${progress * 100}%`;
  }

  attachEventListeners();
}

const countdownTimer = new CountdownTimer();
