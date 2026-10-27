import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deadlinebuddy.app',
  appName: 'Deadline Buddy',
  webDir: 'www',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#ff8ba7',
      sound: 'beep.wav'
    }
  }
};

export default config;
