const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        resizable : false, //크기 조절 비활성화
        backgroundColor: '#2f2f2f',
        icon: path.join(__dirname, 'assets', 'B2PIcon.png'), // 아이콘 설정
        webPreferences: {
            nodeIntegration: true,
        },
        autoHideMenuBar : true, //메뉴 숨기기
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenu(null); // 메뉴 제거
    //mainWindow.webContents.openDevTools(); //개발자 도구 실행
});

