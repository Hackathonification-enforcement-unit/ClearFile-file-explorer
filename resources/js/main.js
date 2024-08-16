// Spaghetti code management LLC
Neutralino.init();

const gravityStrength = 5; // la gravity lesgoski speed
const files = [];
const sizes = [];
let offset = 0;
let multiplier = 0;
let draggingFile = null;
const dragOffset = { x: 0, y: 0 }; // Offset of the mouse when dragging stuff around
let isDragging = false; // Chat, are we dragging rn?
const oscillationFrequency = 0.005;
const oscillationAmplitude = 5;

let homeDir = NL_CWD;
let currentPath = NL_CWD;

document.addEventListener("DOMContentLoaded", () => {
	getHome();
});

async function getHome() {
    currentPath = await Neutralino.os.getEnv("HOME") || await Neutralino.os.getEnv("USERPROFILE");

	homeDir = currentPath

    loadFilesFromDirectory(currentPath)
}

function updatePath() {
	const path = document.getElementById("path");
	path.innerText = currentPath;
}

// getHome();

async function loadFilesFromDirectory(path) {
	currentPath = path;

	updatePath();

	try {
		const directory = await Neutralino.filesystem.readDirectory(path);

		const container = document.getElementById("browserContainer");
		container.innerHTML = "";

		files.length = 0; // Clear the files array
		sizes.length = 0; // Clear the sizes array

		directory.forEach((entry, index) => {
			createFileElement(entry, index, path);
		});

		calculateOffset();
	} catch (error) {
		console.error("Failed to load files:", error);
	}
}

function calculateOffset() {
	if (sizes.length === 0) return;

	const container = document.getElementById("browserContainer");
	offset = Math.min(...sizes);
	const highestItem = Math.max(...sizes);
	const screenHeight = container.offsetHeight - 100;
	multiplier = screenHeight / (highestItem - offset);
}

async function createFileElement(entry, index, parentPath) {
	const container = document.getElementById("browserContainer");

	const fileElement = document.createElement("div");
	fileElement.className = "file";
	fileElement.style.top = `${20 + index * 20}px`;
	const minX = 100; // Minimum x position
	const maxX = container.clientWidth - fileElement.offsetWidth; // Maximum x position, considering the element's width

	// Generate a random x position within the range
	const randomX = Math.random() * (maxX - minX) + minX - 100;

	// Apply the random x position to the element
	fileElement.style.left = `${randomX}px`;
	fileElement.innerHTML = entry.entry;

	container.appendChild(fileElement);
	files.push(fileElement);

	// Apply gravity

	fileElement.addEventListener("mousedown", (event) => {
        if (event.button === 2) return event.preventDefault();

		draggingFile = fileElement;
		isDragging = true;

		dragOffset.x = event.clientX - fileElement.getBoundingClientRect().left;
		dragOffset.y = event.clientY - fileElement.getBoundingClientRect().top;

		fileElement.classList.add("dragging");
	});

	document.addEventListener("mousemove", (event) => {
		if (isDragging) {
			moveFile(event.pageX, event.pageY);
		}
	});

	document.addEventListener("mouseup", () => {
		if (isDragging) {
			setTimeout(() => {
				if (draggingFile) draggingFile.classList.remove("dragging");

				applyGravity(draggingFile);

				draggingFile = null;
				isDragging = false;

				if (draggingFile) applyGravity(draggingFile);
			}, 1);
		}
	});

	function moveFile(pageX, pageY) {
		if (draggingFile) {
			const containerRect = container.getBoundingClientRect();
			const newLeft = Math.min(
				Math.max(0, pageX - containerRect.left - dragOffset.x),
				containerRect.width - draggingFile.offsetWidth,
			);
			const newTop = Math.min(
				Math.max(0, pageY - containerRect.top - dragOffset.y),
				containerRect.height - draggingFile.offsetHeight,
			);

			draggingFile.style.left = `${newLeft}px`;
			draggingFile.style.top = `${newTop}px`;
		}
	}

	fileElement.ondragstart = () => false;

	fileElement.addEventListener("dblclick", async () => {
		updatePath();
		window.getSelection().removeAllRanges();

		const fullPath = `${parentPath}/${entry.entry}`;

		if (entry.type === "DIRECTORY") {
			loadFilesFromDirectory(fullPath);
		} else if (entry.type === "FILE") {
			await Neutralino.os.open(`file://${currentPath}/${entry.entry}`);
		}
	});

	fileElement.addEventListener("contextmenu", async (event) => {
		event.preventDefault();

		const fullPath = `${parentPath}/${entry.entry}`;

		if (entry.type === "DIRECTORY") {
			const folderSize = await getFolderSize(fullPath);
			alert(`Folder size of ${entry.entry}: ${formatBytes(folderSize)}`);
		} else if (entry.type === "FILE") {
			const stats = await Neutralino.filesystem.getStats(fullPath);
			alert(`File size of ${entry.entry}: ${formatBytes(stats.size)}`);
		}
	});

	const fullPath = `${parentPath}/${entry.entry}`;
	let size = 0;

	if (entry.type === "DIRECTORY") {
		fileElement.classList.add("icon-folder");
        
		try {
			size = await getFolderSize(fullPath);
		} catch (error) {
			fileElement.classList.add("icon-locked-folder");

			console.error(`Failed to get size for ${fullPath}:`, error);
			return;
		}
	} else {
		fileElement.classList.add("icon-file");

		try {
			const stats = await Neutralino.filesystem.getStats(fullPath);
			size = stats.size;
		} catch (error) {
			fileElement.classList.add("icon-locked-folder");

			console.error(`Failed to get size for ${fullPath}:`, error);
			return;
		}
	}

	sizes.push(size);
	calculateOffset();

	// Update target Y position based on size
	let targetY = (size - offset) * multiplier;

	if (Number.isNaN(targetY)) {
		targetY = 0;
	}
	fileElement.dataset.targetY = targetY;
}

function applyGravity(file, timestamp) {
	if (file && !isDragging) {
		const targetY = Number.parseFloat(file.dataset.targetY);
		const currentTop = Number.parseFloat(file.style.top || "0");

		// Sine wave oscillation effect
		const oscillation =
			oscillationAmplitude * Math.sin(oscillationFrequency * timestamp);

		if (Math.abs(currentTop - (targetY + oscillation)) <= gravityStrength) {
			file.style.top = `${targetY + oscillation}px`;
		} else {
			const step = gravityStrength;

			if (currentTop < targetY + oscillation) {
				file.style.top = `${Math.min(currentTop + step, targetY + oscillation)}px`;
			} else {
				file.style.top = `${Math.max(currentTop - step, targetY + oscillation)}px`;
			}
		}
	}
}

setInterval(() => {
	const timestamp = performance.now();

	for (const file of files) {
		applyGravity(file, timestamp);
	}
}, 20);

async function getFolderSize(path) {
	const directory = await Neutralino.filesystem.readDirectory(path);
	let totalSize = 0;
	let loops = 0;

	for (const entry of directory) {
		loops++;

		if (loops > 500) break;

		try {
			const fullPath = `${path}/${entry.entry}`;

			if (entry.type === "DIRECTORY") {
				totalSize += await getFolderSize(fullPath);
			} else if (entry.type === "FILE") {
				const stats = await Neutralino.filesystem.getStats(fullPath);
				totalSize += stats.size;
			}
		} catch (err) {
			console.log(err);
		}
	}

	return totalSize;
}

function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

Neutralino.events.on("windowClose", () => {
	Neutralino.app.exit();
});

document.getElementById("homeBtn").addEventListener("click", () => {
	loadFilesFromDirectory(homeDir);
});

document.getElementById("refreshBtn").addEventListener("click", async () => {
	await captcha()

    document.getElementById("browserContainer").innerHTML = "";
    loadFilesFromDirectory(currentPath);
});

document.getElementById("aboutBtn").addEventListener("click", async () => {
    const response = await Neutralino.os.showMessageBox("Confirm", "You are going to open an external browser, proceed?", "OK_CANCEL", "QUESTION");

	if (response === "OK") Neutralino.os.open("https://github.com/Hackathonification-enforcement-unit/ClearFile-file-explorer/blob/main/README.md");
});

document.getElementById("newFolderBtn").addEventListener("click", () => {
	document.getElementById("folderModal").style.display = "flex";
	document.getElementById("folderName").focus();
});

document.getElementById("newFileBtn").addEventListener("click", () => {
	document.getElementById("fileModal").style.display = "flex";
	document.getElementById("fileName").focus();
});

function closeModal() {
	document.getElementById("folderModal").style.display = "none";
	document.getElementById("fileModal").style.display = "none";

	document.getElementById("folderName").value = "";
	document.getElementById("fileName").value = "";
}

document.getElementById("cancelFolderBtn").addEventListener("click", closeModal);
document.getElementById("cancelFileBtn").addEventListener("click", closeModal);

document.getElementById("createFolderBtn").addEventListener("click", async () => {
		await captcha();

		const folderName =
			document.getElementById("folderName").value || "newFolder";

		const oldFiles = await Neutralino.filesystem.readDirectory(currentPath);

		if (oldFiles.find((file) => file.entry === folderName)) {
			return alert("A folder with this name already exists");
		}

		Neutralino.filesystem.createDirectory(`${currentPath}/${folderName}`);

		const files = await Neutralino.filesystem.readDirectory(currentPath);

		const fileIndex = files.findIndex((file) => file.entry === folderName);

		createFileElement(files[fileIndex], fileIndex, currentPath);

		closeModal();
	});

document.getElementById("createFileBtn").addEventListener("click", async () => {
	await captcha();

	const fileName = document.getElementById("fileName").value || "newFile.txt";

	const oldFiles = await Neutralino.filesystem.readDirectory(currentPath);

	if (oldFiles.find((file) => file.entry === fileName)) {
		return alert("A file with this name already exists");
	}

	Neutralino.filesystem.appendFile(`${currentPath}/${fileName}`, "");

	const files = await Neutralino.filesystem.readDirectory(currentPath);

	const fileIndex = files.findIndex((file) => file.entry === fileName);

	createFileElement(files[fileIndex], fileIndex, currentPath);

	closeModal();
});

document.getElementById("backBtn").addEventListener("click", () => {
	if (currentPath === "/") return alert("You are already at the root folder!");

	updatePath();

	let prevPath = currentPath.split("/");
	prevPath.pop();
	prevPath = prevPath.join("/");

	loadFilesFromDirectory(prevPath);
});

function debounce(func, wait) {
	let timeout;

	return function (...args) {
		clearTimeout(timeout);

		timeout = setTimeout(() => func.apply(this, args), wait);
	};
}
// Function to get the current window position
function getWindowPosition() {
	return Neutralino.window.getPosition();
}

async function handleWindowPositionChange() {
	try {
		document.getElementById("browserContainer").innerHTML = "";

		await loadFilesFromDirectory(currentPath);
	} catch (error) {
		console.error("Error during position change handling:", error);
	}
}

// Debounced function to handle updates
const debouncedHandleWindowPositionChange = debounce(
	handleWindowPositionChange,
	500,
);

async function monitorWindowPosition() {
	let previousPosition = await getWindowPosition();

	setInterval(async () => {
		try {
			const currentPosition = await getWindowPosition();

			if (
				currentPosition.x !== previousPosition.x ||
				currentPosition.y !== previousPosition.y
			) {
				debouncedHandleWindowPositionChange();

				previousPosition = currentPosition;
			}
		} catch (error) {
			console.error("Error getting window position:", error);
		}
	}, 100);
}

// Start monitoring
monitorWindowPosition();

let captchaAnswer = 0; // Rotate the image by 0, 90, 180, or 270 degrees, im lazy :)

let captchaPromise;
let resolveCaptchaPromise;

async function captcha() {
	// Reset image rotation and loading bar
	document.getElementById("messageBox").innerHTML = "";
	const captchaImage = document.getElementById("captchaImage");
	captchaAnswer = Math.floor(Math.random() * 4) * 90;
	captchaImage.style.transform = "rotate(0deg)";
	captchaImage.dataset.rotation = 0;

	document.getElementById("captchaContainer").style.display = "block";
	document.getElementById("captchaOverlay").style.display = "block";

	captchaPromise = new Promise((resolve) => {
		resolveCaptchaPromise = resolve;
	});

	return captchaPromise;
}

document.getElementById("captchaImage").addEventListener("click", function () {
	let currentRotation = Number.parseInt(this.dataset.rotation);
	currentRotation = (currentRotation + 90) % 360;
	this.style.transform = `rotate(${currentRotation}deg)`;
	this.dataset.rotation = currentRotation;
});

function validateCaptcha() {
	const userRotation = Number.parseInt(
		document.getElementById("captchaImage").dataset.rotation,
	);
	startLoading();

	setTimeout(() => {
		// Chat, is this fr?
		const messageDiv = document.getElementById("messageBox");
		messageDiv.style.marginTop = "10px";
		messageDiv.style.fontSize = "16px";
		messageDiv.style.fontWeight = "bold";

		if (userRotation === captchaAnswer) {
			messageDiv.innerText = "Captcha passed, free to go!";
			messageDiv.style.color = "green";
			document.getElementById("captchaContainer").appendChild(messageDiv);

			setTimeout(() => {
				closeCaptcha();
			}, 1500);
		} else {
			messageDiv.innerText =
				"Are you a robot? Try again. This incident will be reported.";
			messageDiv.style.color = "red";
			document.getElementById("captchaContainer").appendChild(messageDiv);

			resetLoading();
			setTimeout(() => {
				messageDiv.innerHTML = "";
			}, 2000);
		}
	}, 6000);
}

function startLoading() {
	const loadingBar = document.getElementById("loadingBar");
	const loadingText = document.getElementById("loadingText");
	const sentences = [
		"Observing superposition...",
		"Calculating formula...",
		"Simulating space-time...",
		"Mining bitcoin...",
		"Analyzing data...",
		"Hacking into the system...",
		"Compiling Doom",
		"Encrypting files...",
		"Attempting to observe the quantum environment",
	];
	let i = 0;

	resetLoading();

	document.getElementById("loadingBarContainer").style.display = "block";
	loadingText.innerText = sentences[i];

	const loadingInterval = setInterval(() => {
		if (loadingBar.style.width === "100%") {
			clearInterval(loadingInterval);
		} else {
			loadingBar.style.width = `${Number.parseInt(loadingBar.style.width) + 10}%`;
			i = (i + 1) % sentences.length;
			loadingText.innerText = sentences[i];
		}
	}, 500);
}

function resetLoading() {
	const loadingBar = document.getElementById("loadingBar");
	const loadingText = document.getElementById("loadingText");

	loadingBar.style.width = "0";
	loadingText.innerText = "";

	document.getElementById("loadingBarContainer").style.display = "none";
}

function closeCaptcha() {
	resetLoading();
	// Hide the popup and continue execution
	document.getElementById("captchaContainer").style.display = "none";
	document.getElementById("captchaOverlay").style.display = "none";
	document.getElementById("captchaImage").dataset.rotation = 0;

	if (resolveCaptchaPromise) {
		resolveCaptchaPromise();

		resolveCaptchaPromise = null; // Clean up
	}
}
