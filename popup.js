const replySlider = document.querySelector('[name="threshold"]');
const valueSlider = document.querySelector('#value');
const styleButton = document.querySelector('#style');
const invrtButton = document.querySelector('#invert');

// https://bobbyhadz.com/blog/javascript-add-trailing-zeros-to-number
function addTrailingZeros(num, totalLength) {
  return String(num).padEnd(totalLength, '0');
}

function chromeNotify() {
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		chrome.tabs.sendMessage(
			tabs[0].id, {
				subject: "update"
			}
		)
	});
}
function chromeFetch(property) {
	return new Promise(function(resolve) {
		chrome.storage.local.get(property, function(obj) {
			resolve(obj[property]);
		});
	});
}

function thresholdStore() {
	chrome.storage.local.set({
		threshold: replySlider.value
	});
	chromeNotify();
	valueSlider.innerText = addTrailingZeros(replySlider.value, 5);
}
function styleStore() {
	let bool = !(/true/).test(styleButton.getAttribute('aria-pressed'));
	styleButton.setAttribute('aria-pressed', bool);
	chrome.storage.local.set({
		style: bool
	});
	chromeNotify();
}
function invrtStore() {
	let bool = !(/true/).test(invrtButton.getAttribute('aria-pressed'));
	invrtButton.setAttribute('aria-pressed', bool);
	chrome.storage.local.set({
		invert: bool
	});
	chromeNotify();
}

async function sliderInit() {
	let threshold = await chromeFetch("threshold");
	if (threshold)
		replySlider.value = threshold;
	else
		replySlider.value = 0.1;
	valueSlider.innerText = addTrailingZeros(replySlider.value, 5);
}
async function buttonInit() {
	let styleBool = await chromeFetch("style");
	let invrtBool = await chromeFetch("invert");
	styleButton.ariaPressed = styleBool;
	invrtButton.ariaPressed = invrtBool;
}

sliderInit();
buttonInit();

replySlider.addEventListener('input', thresholdStore);
styleButton.addEventListener('click', styleStore);
invrtButton.addEventListener('click', invrtStore);