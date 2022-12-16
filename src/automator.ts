// https://stackoverflow.com/a/4446309/10379728
const unallowedRange = /[\u0600-\u06FF]/;

function getIncorrectButton() {
  const node = document.evaluate(
    "//button[. = 'Incorrect']",
    document,
    null,
    XPathResult.ANY_TYPE,
    null,
  ).iterateNext();

  return node instanceof HTMLButtonElement ? node : null;
}
function getSuggestion() {
  const node = document.evaluate(
    "//span[@lang='ku']",
    document,
    null,
    XPathResult.ANY_TYPE,
    null,
  ).iterateNext();

  return node instanceof HTMLSpanElement ? node.innerText : null;
}

function getToTranslate() {
  const node = document.evaluate(
    "//span[@lang='ku']",
    document,
    null,
    XPathResult.ANY_TYPE,
    null,
  ).iterateNext();

  return node instanceof HTMLSpanElement ? node.innerHTML : null;
}
function getFlagButton() {
  const node = document.evaluate(
    "//button[@title='Flag for review']",
    document,
    null,
    XPathResult.ANY_TYPE,
    null,
  ).iterateNext();

  return node instanceof HTMLButtonElement ? node : null;
}

enum ContributionStatus {
  Validation,
  Translation,
}

function getContributionStatus() {
  if (
    document.evaluate(
        "//div[. = 'Is this translation correct?']",
        document,
        null,
        XPathResult.ANY_TYPE,
        null,
      ).iterateNext() != null &&
    getIncorrectButton() != null && getSuggestion() != null
  ) {
    return ContributionStatus.Validation;
  } else if (
    document.evaluate(
        "//div[. = 'Translate the following text']",
        document,
        null,
        XPathResult.ANY_TYPE,
        null,
      ).iterateNext() != null &&
    getToTranslate() != null && getFlagButton() != null
  ) {
    return ContributionStatus.Translation;
  }

  return null;
}

async function click(button: HTMLButtonElement) {
  for (let i = 0; i < 3; i++) {
    button.style.opacity = "0.5";
    await new Promise((r) => setTimeout(r, 500));
    button.style.opacity = "1";
    await new Promise((r) => setTimeout(r, 500));
  }
  button.click();
}

setInterval(async () => {
  console.debug("Checking contribution status...");

  switch (getContributionStatus()) {
    case ContributionStatus.Validation:
      console.debug("Validating. Checking suggestion...");

      if (unallowedRange.test(getSuggestion()!)) {
        console.debug("Suggestion not allowed. Marking as incorrect...");
        await click(getIncorrectButton()!);
        console.debug("Marked suggestion as correct.");
      }

      break;
    case ContributionStatus.Translation:
      console.debug("Translating. Checking source...");

      if (unallowedRange.test(getToTranslate()!)) {
        console.debug("Source not allowed. Flagging...");
        await click(getFlagButton()!);
        console.debug("Flagged translation source.");
      }

      break;
    case null:
      console.debug("Not contributing.");
  }
}, 1000);
