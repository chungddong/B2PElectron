const { app, BrowserWindow, screen, dialog, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let pptWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 700,
        height: 650,
        resizable : false, //크기 조절 비활성화
        backgroundColor: '#2f2f2f',
        icon: path.join(__dirname, 'assets', 'B2PIcon.png'), // 아이콘 설정
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar : true, //메뉴 숨기기
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenu(null); // 메뉴 제거
    //mainWindow.webContents.openDevTools(); //개발자 도구 실행
    
    // 앱 종료 시 PPT 히스토리 삭제
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

// IPC 핸들러들
ipcMain.handle('get-all-displays', () => {
    return screen.getAllDisplays().map(display => ({
        id: display.id,
        bounds: display.bounds,
        workArea: display.workArea
    }));
});

ipcMain.handle('open-file-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
});

// PPT 창 열기/닫기 IPC 핸들러
ipcMain.handle('open-ppt-window', async () => {
    if (pptWindow && !pptWindow.isDestroyed()) {
        pptWindow.focus();
        return;
    }

    pptWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        autoHideMenuBar: true,
        resizable: true
    });

    pptWindow.loadFile('ppt.html');
    //pptWindow.webContents.openDevTools(); // PPT 창에서도 개발자 도구 열기

    pptWindow.on('closed', () => {
        pptWindow = null;
    });
});

ipcMain.handle('close-ppt-window', () => {
    if (pptWindow && !pptWindow.isDestroyed()) {
        pptWindow.close();
        pptWindow = null;
    }
});

ipcMain.handle('focus-ppt-window', () => {
    if (pptWindow && !pptWindow.isDestroyed()) {
        pptWindow.focus();
    }
});

