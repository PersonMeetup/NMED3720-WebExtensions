const replySlider = document.querySelector('[name="threshold"]');

function chromeFetch(property) {
	return new Promise(function(resolve) {
		chrome.storage.local.get(property, function(obj) {
			resolve(obj[property]);
		});
	});
}
function chromeStore() {
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

async function sliderInit() {
	let threshold = await chromeFetch("threshold");
	if (threshold)
		replySlider.value = threshold;
	else
		replySlider.value = 0.1;
}

sliderInit();
replySlider.addEventListener('input', chromeStore);