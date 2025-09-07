const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    openSlideWindow: (verses, bookName, chapter) => {
        ipcRenderer.send("open-slide-window", { verses, bookName, chapter });
    },
    closeSlideWindow: () => ipcRenderer.send("close-slide-window"),
    onReceiveVerseData: (callback) => ipcRenderer.on("send-verse-data", (_event, data) => callback(data)),
    
    // 모든 디스플레이 정보 가져오기
    getAllDisplays: () => ipcRenderer.invoke('get-all-displays'),
    
    // 파일 선택 다이얼로그 열기
    openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
    
    // PPT 창 관리
    openPPTWindow: () => ipcRenderer.invoke('open-ppt-window'),
    closePPTWindow: () => ipcRenderer.invoke('close-ppt-window'),
    focusPPTWindow: () => ipcRenderer.invoke('focus-ppt-window')
});
