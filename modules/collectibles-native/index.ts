// Reexport the native module. On web, it will be resolved to CollectiblesNativeModule.web.ts
// and on native platforms to CollectiblesNativeModule.ts
export { default } from './src/CollectiblesNativeModule';
export { default as CollectiblesNativeView } from './src/CollectiblesNativeView';
export * from  './src/CollectiblesNative.types';
