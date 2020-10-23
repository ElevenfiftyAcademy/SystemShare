const { app, BrowserWindow } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
    },
    title: "Eleven Fifty Academy System Detection",
  });

  win.loadFile("./src/views/index.html");
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});
