const replySlider = document.querySelector('[name="threshold"]');
const styleButton = document.querySelector('#style');

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
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		chrome.tabs.sendMessage(
			tabs[0].id, {
				subject: "update",
				message: "threshold"
			}
		)
	})
}
function styleStore() {
	let bool = !(/true/).test(styleButton.getAttribute('aria-pressed'));
	console.log(bool);
	styleButton.setAttribute('aria-pressed', bool);
	chrome.storage.local.set({
		style: bool
	});
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		chrome.tabs.sendMessage(
			tabs[0].id, {
				subject: "update",
				message: "style"
			}
		)
	})
}

async function sliderInit() {
	let threshold = await chromeFetch("threshold");
	if (threshold)
		replySlider.value = threshold;
	else
		replySlider.value = 0.1;
}
async function buttonInit() {
	let bool = await chromeFetch("style");
	styleButton.ariaPressed = bool; // Is this prepped to work on fresh installs?
}

sliderInit();
buttonInit();

replySlider.addEventListener('input', thresholdStore);
styleButton.addEventListener('click', styleStore);