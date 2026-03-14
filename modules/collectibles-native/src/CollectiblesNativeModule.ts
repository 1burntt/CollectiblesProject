import { NativeModule, requireNativeModule } from 'expo';

import { CollectiblesNativeModuleEvents } from './CollectiblesNative.types';

declare class CollectiblesNativeModule extends NativeModule<CollectiblesNativeModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<CollectiblesNativeModule>('CollectiblesNative');
