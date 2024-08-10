// Load Neutralino configuration and set up basic events
Neutralino.init();

let gravityStrength = 0.5; // Adjust the gravity strength here
let files = [];
let draggingFile = null;
let dragOffset = { x: 0, y: 0 }; // Offset of the mouse when dragging

document.addEventListener('DOMContentLoaded', () => {
    loadFilesFromDirectory(NL_PATH); // Load files when the app starts
});

async function loadFilesFromDirectory(path) {
    try {
        // Use Neutralino's filesystem API to read the contents of a directory
        const directory = await Neutralino.filesystem.readDirectory(path);

        const container = document.getElementById('browserContainer');

        // Clear any existing files
        container.innerHTML = '';

        directory.forEach((entry, index) => {
            createFileElement(entry, index, path);
        });
    } catch (error) {
        console.error('Failed to load files:', error);
    }
}

function createFileElement(entry, index, parentPath) {
    const container = document.getElementById('browserContainer');

    // Create the file element
    let fileElement = document.createElement('div');
    fileElement.className = 'file';
    fileElement.style.top = `${20 + index * 20}px`;
    fileElement.style.left = `${20 + index * 130}px`;
    fileElement.innerHTML = entry.entry;

    container.appendChild(fileElement);
    files.push(fileElement);

    let speed = 0;
    let falling = true;

    // Apply gravity
    function applyGravity() {
        if (falling && draggingFile !== fileElement) { // Apply gravity only if not dragging this file
            speed += gravityStrength;
            const fileRect = fileElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            if (fileRect.bottom + speed >= containerRect.bottom) {
                fileElement.style.top = `${containerRect.height - fileRect.height}px`;
                speed = 0;
                falling = false;
            } else {
                fileElement.style.top = `${fileElement.offsetTop + speed}px`;
            }

            // Check for collisions with other files
            files.forEach(otherFile => {
                if (otherFile !== fileElement) {
                    const otherRect = otherFile.getBoundingClientRect();
                    if (isColliding(fileRect, otherRect)) {
                        fileElement.style.top = `${otherFile.offsetTop - fileRect.height}px`;
                        speed = 0;
                        falling = false;
                    }
                }
            });
        }
    }

    setInterval(applyGravity, 20);

    // Handle file dragging
    fileElement.addEventListener('mousedown', function (event) {
        draggingFile = fileElement;
        falling = false;

        // Calculate the offset of the mouse within the file
        dragOffset.x = event.clientX - fileElement.getBoundingClientRect().left;
        dragOffset.y = event.clientY - fileElement.getBoundingClientRect().top;

        fileElement.classList.add('dragging');
    });

    document.addEventListener('mousemove', function (event) {
        if (draggingFile === fileElement) { // Only move the file that is being dragged
            moveFile(event.pageX, event.pageY);
        }
    });

    document.addEventListener('mouseup', function () {
        if (draggingFile === fileElement) { // Only stop dragging the correct file
            draggingFile.classList.remove('dragging');
            draggingFile = null;
            falling = true;
        }
    });

    function moveFile(pageX, pageY) {
        if (draggingFile) {
            const containerRect = container.getBoundingClientRect();

            // Ensure the dragged file stays within the container bounds
            let newLeft = Math.min(Math.max(0, pageX - containerRect.left - dragOffset.x), containerRect.width - draggingFile.offsetWidth);
            let newTop = Math.min(Math.max(0, pageY - containerRect.top - dragOffset.y), containerRect.height - draggingFile.offsetHeight);

            draggingFile.style.left = `${newLeft}px`;
            draggingFile.style.top = `${newTop}px`;
        }
    }

    fileElement.ondragstart = function () {
        return false;
    };

    // Handle file or folder click
    fileElement.addEventListener('click', async function () {
        const fullPath = `${parentPath}/${entry.entry}`;
        if (entry.type === 'DIRECTORY') {
            loadFilesFromDirectory(fullPath); // Open folder
        } else if (entry.type === 'FILE') {
            const content = await Neutralino.filesystem.readFile(fullPath);
            await Neutralino.os.execCommand(`xdg-open ${fullPath}`, { background: true });
            /* alert(`Content of ${entry.entry}:\n${content}`); // Open and show file content (or you can handle this differently) */
        }
    });

    // Get size and display it
    fileElement.addEventListener('contextmenu', async function (event) {
        event.preventDefault(); // Prevent the default context menu
        const fullPath = `${parentPath}/${entry.entry}`;
        if (entry.type === 'DIRECTORY') {
            const folderSize = await getFolderSize(fullPath);
            alert(`Folder size of ${entry.entry}: ${formatBytes(folderSize)}`);
        } else if (entry.type === 'FILE') {
            const stats = await Neutralino.filesystem.getStats(fullPath);
            alert(`File size of ${entry.entry}: ${formatBytes(stats.size)}`);
        }
    });
}

async function getFolderSize(path) {
    const directory = await Neutralino.filesystem.readDirectory(path);
    let totalSize = 0;

    for (const entry of directory) {
        const fullPath = `${path}/${entry.entry}`;
        if (entry.type === 'DIRECTORY') {
            totalSize += await getFolderSize(fullPath); // Recursively add folder sizes
        } else if (entry.type === 'FILE') {
            const stats = await Neutralino.filesystem.getStats(fullPath);
            totalSize += stats.size;
        }
    }

    return totalSize;
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

Neutralino.events.on("windowClose", () => {
    Neutralino.app.exit();
});


document.getElementById('homeBtn').addEventListener('click', () => {
    // Handle home button action
    alert('Home clicked!');
    // You could reload the root directory or perform any home action
});

document.getElementById('refreshBtn').addEventListener('click', () => {
    // Handle refresh button action
    document.getElementById('browserContainer').innerHTML = ''; // Clear current view
    loadFilesFromDirectory(NL_PATH); // Reload the files from the root directory
});

document.getElementById('aboutBtn').addEventListener('click', () => {
    // Handle about button action
    alert('This is a Gravity File Browser app with a gravity effect on files!');
    // You could show an about dialog or page
});