import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './CollectiblesNative.types';

type CollectiblesNativeModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class CollectiblesNativeModule extends NativeModule<CollectiblesNativeModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(CollectiblesNativeModule, 'CollectiblesNativeModule');
