import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thinktecutre.demo.enterjs',
  appName: 'ng-babylonjs-simpel-integration',
  webDir: 'dist/ng-babylonjs-simpel-integration',
  server: {
    androidScheme: 'https',
    cleartext: true,
    url: 'http://192.168.20.80:4200'
  }
};

export default config;
