const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('DeadlineBuddyDeviceReminders', {
    syncTasks(payload) {
        return ipcRenderer.invoke('deadline:sync-tasks', payload);
    },

    sendTestNotification() {
        return ipcRenderer.invoke('deadline:test-notification');
    },

    setStartWithWindows(enabled) {
        return ipcRenderer.invoke('deadline:set-start-with-windows', Boolean(enabled));
    },

    getStartWithWindows() {
        return ipcRenderer.invoke('deadline:get-start-with-windows');
    }
});
