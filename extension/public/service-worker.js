console.log("Service worker do V.Inc Web iniciado."); 

chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({
        openPanelOnActionClick : true
    });
})