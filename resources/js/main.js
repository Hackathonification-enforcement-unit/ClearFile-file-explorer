// Load Neutralino configuration and set up basic events
Neutralino.init();

const gravityStrength = 0.5; // Adjust the gravity strength here
const files = [];
let draggingFile = null;
const dragOffset = { x: 0, y: 0 }; // Offset of the mouse when dragging
let isDragging = false; // Flag to check if dragging is occurring

document.addEventListener('DOMContentLoaded', () => {
    loadFilesFromDirectory(NL_PATH); // Load files when the app starts
});

let currentPath = NL_PATH;

async function loadFilesFromDirectory(path) {
    currentPath = path;

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
    const fileElement = document.createElement('div');
    fileElement.className = 'file';
    fileElement.style.top = `${20 + index * 20}px`;
    fileElement.style.left = `${20 + index * 130}px`;
    fileElement.innerHTML = entry.entry;

    container.appendChild(fileElement);
    files.push(fileElement);

    let speed = 0;
    let falling = true;

    // Apply gravity
    function applyGravity(file = fileElement) {
        if (falling && draggingFile !== file) { // Apply gravity only if not dragging this file
            speed += gravityStrength;
            
            const fileRect = file.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            if (fileRect.bottom + speed >= containerRect.bottom) {
                file.style.top = `${containerRect.height - fileRect.height}px`;
                speed = 0;
                falling = false;
            } else {
                file.style.top = `${file.offsetTop + speed}px`;
            }

            // Check for collisions with other files
            for (const otherFile of files) {
                if (otherFile !== file) {
                    const otherRect = otherFile.getBoundingClientRect();
                    if (isColliding(fileRect, otherRect)) {
                        file.style.top = `${otherFile.offsetTop - fileRect.height}px`;
                        speed = 0;
                        falling = false;
                    }
                }
            }
        }
    }

    setInterval(applyGravity, 20);

    // Handle file dragging
    fileElement.addEventListener('mousedown', (event) => {
        window.getSelection().removeAllRanges()
        draggingFile = fileElement;
        isDragging = true; // Set dragging flag to true

        // Calculate the offset of the mouse within the file
        dragOffset.x = event.clientX - fileElement.getBoundingClientRect().left;
        dragOffset.y = event.clientY - fileElement.getBoundingClientRect().top;

        fileElement.classList.add('dragging');
    });

    document.addEventListener('mousemove', (event) => {
        window.getSelection().removeAllRanges()
        if (isDragging) { // Only move the file if dragging
            moveFile(event.pageX, event.pageY);
        }
    });

    document.addEventListener('mouseup', () => {
        window.getSelection().removeAllRanges()
        if (isDragging) { // Only stop dragging if dragging
            setTimeout(() => {
                draggingFile.classList.remove('dragging');
                draggingFile = null;
                isDragging = false; // Reset dragging flag
                falling = true;

                applyGravity(draggingFile)
            }, 1)
        }
    });

    function moveFile(pageX, pageY) {
        if (draggingFile) {
            const containerRect = container.getBoundingClientRect();

            // Ensure the dragged file stays within the container bounds
            const newLeft = Math.min(Math.max(0, pageX - containerRect.left - dragOffset.x), containerRect.width - draggingFile.offsetWidth);
            const newTop = Math.min(Math.max(0, pageY - containerRect.top - dragOffset.y), containerRect.height - draggingFile.offsetHeight);

            draggingFile.style.left = `${newLeft}px`;
            draggingFile.style.top = `${newTop}px`;
        }
    }

    fileElement.ondragstart = () => {
        return false
    };

    // Handle file or folder click
    fileElement.addEventListener('dblclick', async () => {
        window.getSelection().removeAllRanges()
        // if (!isDragging) { // Open file only if not dragging
            const fullPath = `${parentPath}/${entry.entry}`;
            if (entry.type === 'DIRECTORY') {
                loadFilesFromDirectory(fullPath); // Open folder
            } else if (entry.type === 'FILE') {
                const content = await Neutralino.filesystem.readFile(fullPath);
                await Neutralino.os.execCommand(`xdg-open ${fullPath}`, { background: true });
                /* alert(`Content of ${entry.entry}:\n${content}`); // Open and show file content (or you can handle this differently) */
            }
        // }
    });

    // Get size and display it
    fileElement.addEventListener('contextmenu', async (event) => {
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
    return `${Number.parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
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
    loadFilesFromDirectory(NL_PATH);
    // You could reload the root directory or perform any home action
});

document.getElementById('refreshBtn').addEventListener('click', () => {
    // Handle refresh button action
    document.getElementById('browserContainer').innerHTML = ''; // Clear current view
    loadFilesFromDirectory(currentPath); // Reload the files from the root directory
});

document.getElementById('aboutBtn').addEventListener('click', () => {
    // Handle about button action
    alert('This is a Gravity File Browser app with a gravity effect on files!');
    // You could show an about dialog or page
});

document.getElementById('newFolderBtn').addEventListener('click', async () => {
    

    const directory = await Neutralino.filesystem.readDirectory(path);
})