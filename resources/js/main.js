// Spaghetti code management LLC
Neutralino.init();

const gravityStrength = 0.5; // la gravity lesgoski spped
const files = [];
const sizes = [];
let offset = 0;
let multiplier = 0;
let draggingFile = null;
const dragOffset = { x: 0, y: 0 }; // Offset of the mouse when dragging stuff around
let isDragging = false; // Chat, are we dragging rn?

document.addEventListener('DOMContentLoaded', () => {
    loadFilesFromDirectory(NL_CWD); // Load da files when the app starts
});

let currentPath = NL_CWD;
function updatePath() {
    const path = document.getElementById('path').textContent = currentPath;
    path.innerHTML = currentPath;
}
updatePath()
async function loadFilesFromDirectory(path) {
    currentPath = path;

    try {
        const directory = await Neutralino.filesystem.readDirectory(path);

        const container = document.getElementById('browserContainer');
        container.innerHTML = '';

        files.length = 0; // Clear the files array
        sizes.length = 0; // Clear the sizes array

        directory.forEach((entry, index) => {
            createFileElement(entry, index, path);
        });

        calculateOffset();
        
    } catch (error) {
        console.error('Failed to load files:', error);
    }
}

function calculateOffset() {
    if (sizes.length === 0) return;
    const container = document.getElementById('browserContainer');
    offset = Math.min(...sizes);
    const highestItem = Math.max(...sizes);
    const screenHeight = container.offsetHeight-100
    multiplier = (screenHeight / (highestItem - offset));
}

async function createFileElement(entry, index, parentPath) {
    const container = document.getElementById('browserContainer');

    const fileElement = document.createElement('div');
    fileElement.className = 'file';
    fileElement.style.top = `${20 + index * 20}px`;
    fileElement.style.left = `${20 + index * 130}px`;
    fileElement.innerHTML = entry.entry;

    container.appendChild(fileElement);
    files.push(fileElement);

    const fullPath = `${parentPath}/${entry.entry}`;
    let size = 0;
    if (entry.type === 'DIRECTORY') {
        try {
            size = await getFolderSize(fullPath);
        } catch (error) {
            console.error(`Failed to get size for ${fullPath}:`, error);
            return;
        }
    } else {
        const stats = await Neutralino.filesystem.getStats(fullPath);
        size = stats.size;
    }

    sizes.push(size);
    calculateOffset();

    // Update target Y position based on size
    const targetY = ((size - offset) * multiplier);
    fileElement.dataset.targetY = targetY;

    // Apply gravity
    setInterval(() => {
        for (const file of files) {
            applyGravity(file)
        }
    }, 20);

    fileElement.addEventListener('mousedown', (event) => {
        window.getSelection().removeAllRanges();
        draggingFile = fileElement;
        isDragging = true;

        dragOffset.x = event.clientX - fileElement.getBoundingClientRect().left;
        dragOffset.y = event.clientY - fileElement.getBoundingClientRect().top;

        fileElement.classList.add('dragging');
    });

    document.addEventListener('mousemove', (event) => {
        window.getSelection().removeAllRanges();
        if (isDragging) {
            moveFile(event.pageX, event.pageY);
        }
    });

    document.addEventListener('mouseup', () => {
        window.getSelection().removeAllRanges();
        if (isDragging) {
            setTimeout(() => {
                if (draggingFile) draggingFile.classList.remove('dragging');
                applyGravity(draggingFile)
                draggingFile = null;
                isDragging = false;

                if (draggingFile) applyGravity(draggingFile);
            }, 1);
        }
    });

    function moveFile(pageX, pageY) {
        if (draggingFile) {
            const containerRect = container.getBoundingClientRect();
            const newLeft = Math.min(Math.max(0, pageX - containerRect.left - dragOffset.x), containerRect.width - draggingFile.offsetWidth);
            const newTop = Math.min(Math.max(0, pageY - containerRect.top - dragOffset.y), containerRect.height - draggingFile.offsetHeight);

            draggingFile.style.left = `${newLeft}px`;
            draggingFile.style.top = `${newTop}px`;
        }
    }

    fileElement.ondragstart = () => false;

    fileElement.addEventListener('dblclick', async () => {
        window.getSelection().removeAllRanges();
        const fullPath = `${parentPath}/${entry.entry}`;
        if (entry.type === 'DIRECTORY') {
            loadFilesFromDirectory(fullPath);
        } else if (entry.type === 'FILE') {
            const content = await Neutralino.filesystem.readFile(fullPath);
            await Neutralino.os.execCommand(`xdg-open ${fullPath}`, { background: true });
        }
    });

    fileElement.addEventListener('contextmenu', async (event) => {
        event.preventDefault();
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

function applyGravity(file) {
    if (file && !isDragging) {
        const targetY = Number.parseFloat(file.dataset.targetY);
        const currentTop = Number.parseFloat(file.style.top || '0');

        if (Math.abs(currentTop - targetY) <= gravityStrength) {
            file.style.top = `${targetY}px`;
        } else {
            const step = gravityStrength;
            if (currentTop < targetY) {
                file.style.top = `${Math.min(currentTop + step, targetY)}px`;
            } else {
                file.style.top = `${Math.max(currentTop - step, targetY)}px`;
            }
        }
    }
}

async function getFolderSize(path) {
    const directory = await Neutralino.filesystem.readDirectory(path);
    let totalSize = 0;
    let loops = 0;
    for (const entry of directory) {
        loops++;
        if (loops > 500) break;
        try{
            const fullPath = `${path}/${entry.entry}`;
        if (entry.type === 'DIRECTORY') {
            totalSize += await getFolderSize(fullPath);
        } else if (entry.type === 'FILE') {
            const stats = await Neutralino.filesystem.getStats(fullPath);
            totalSize += stats.size;
        }
    }catch(err){
        console.log(err);
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

Neutralino.events.on("windowClose", () => {
    Neutralino.app.exit();
});

document.getElementById('homeBtn').addEventListener('click', () => {
    loadFilesFromDirectory(NL_CWD);
});

document.getElementById('refreshBtn').addEventListener('click', () => {
    document.getElementById('browserContainer').innerHTML = '';
    loadFilesFromDirectory(currentPath);
});

document.getElementById('aboutBtn').addEventListener('click', () => {
    alert('This is a Gravity File Browser app with a gravity effect on files!');
});

document.getElementById('newFolderBtn').addEventListener('click', () => {
    document.getElementById('folderModal').style.display = 'flex'
    document.getElementById('folderName').focus()
})

document.getElementById('newFileBtn').addEventListener('click', () => {
    document.getElementById('fileModal').style.display = 'flex'
    document.getElementById('fileName').focus()
})

function closeModal() {
    document.getElementById('folderModal').style.display = 'none';
    document.getElementById('fileModal').style.display = 'none';

    document.getElementById('folderName').value = '';
    document.getElementById('fileName').value = '';
}

document.getElementById('cancelFolderBtn').addEventListener('click', closeModal)
document.getElementById('cancelFileBtn').addEventListener('click', closeModal)

document.getElementById('createFolderBtn').addEventListener('click', async () => {
    const folderName = document.getElementById('folderName').value || "newFolder"

    const oldFiles = await Neutralino.filesystem.readDirectory(currentPath)

    if (oldFiles.find(file => file.entry === folderName)) {
        return alert('A folder with this name already exists');
    }

    Neutralino.filesystem.createDirectory(`${currentPath}/${folderName}`)

    const files = await Neutralino.filesystem.readDirectory(currentPath)

    const fileIndex = files.findIndex(file => file.entry === folderName)

    createFileElement(files[fileIndex], fileIndex, currentPath)

    closeModal()
})

document.getElementById('createFileBtn').addEventListener('click', async () => {
    const fileName = document.getElementById('fileName').value || "newFile.txt"

    const oldFiles = await Neutralino.filesystem.readDirectory(currentPath)

    if (oldFiles.find(file => file.entry === fileName)) {
        return alert('A file with this name already exists');
    }

    Neutralino.filesystem.appendFile(`${currentPath}/${fileName}`, '')

    const files = await Neutralino.filesystem.readDirectory(currentPath)

    const fileIndex = files.findIndex(file => file.entry === fileName)

    createFileElement(files[fileIndex], fileIndex, currentPath)

    closeModal()
})

document.getElementById('backBtn').addEventListener('click', () => {
    if (currentPath === '/') return alert('You are already at the root folder!');
    updatePath()
    let prevPath = currentPath.split('/')
    prevPath.pop()
    prevPath = prevPath.join('/')

    loadFilesFromDirectory(prevPath)
})