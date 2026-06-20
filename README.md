## hexamind

> mac xcode 15.2 低版本必须使用 Expo 54 SDK 兼容 , 真机编译预览需要更高的xcode版本

## 运行

```sh
pnpm start
```

## 创建

```sh
npx create-expo-app@latest
# 启动开发服务器
npx expo start # 局域网
npx expo start --tunnel
```

## 开发版（Development Build） (用了 Expo Go 不支持的原生库)

```sh
npm install -g eas-cli
eas build --profile development --platform ios
eas build --profile development --platform android
# 构建后安装再运行
npx expo start --dev-client
```

## 直接运行到真机 (连接数据线)

```sh
npx expo run:ios --device

# npx expo run:android
# adb devices
```
