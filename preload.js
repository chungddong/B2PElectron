const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    openSlideWindow: (verses, bookName, chapter) => {
        ipcRenderer.send("open-slide-window", { verses, bookName, chapter });
    },
    closeSlideWindow: () => ipcRenderer.send("close-slide-window"),
    onReceiveVerseData: (callback) => ipcRenderer.on("send-verse-data", (_event, data) => callback(data)),
});
