const { app, BrowserWindow } = require('electron');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        resizable : false, //크기 조절 비활성화
        backgroundColor: '#2f2f2f',
        webPreferences: {
            nodeIntegration: true,
        },
        autoHideMenuBar : true, //메뉴 숨기기
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenu(null); // 메뉴 제거
    mainWindow.webContents.openDevTools(); //개발자 도구 실행
});

