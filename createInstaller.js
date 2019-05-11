var electronInstaller = require('electron-winstaller');
resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './release-builds/CodeYellowRaffle-win32-ia32',
    outputDirectory: './builds/installer',
    authors: 'CodeYellow.',
    exe: 'CodeYellowRaffle.exe',
	version: '0.0.8',
	noMsi: true,
	loadingGif: './assets/installer.gif',
	setupIcon: './assets/icons/win/icon.ico'
  });

resultPromise.then(() => console.log("Created"), (e) => console.log(`No dice: ${e.message}`));
