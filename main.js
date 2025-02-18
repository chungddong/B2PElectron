const { app, BrowserWindow } = require('electron');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        resizable : false, //크기 조절 비활성화
        webPreferences: {
            nodeIntegration: true,
        },
        autoHideMenuBar : true, //메뉴 숨기기
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenu(null); // 메뉴 제거
});
