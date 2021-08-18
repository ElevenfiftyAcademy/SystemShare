const { app, BrowserWindow } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 700,
    height: 460,
    webPreferences: {
      nodeIntegration: true,
    },
    title: "Eleven Fifty Academy System Detection",
  });
  win.loadFile("./src/views/index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});
