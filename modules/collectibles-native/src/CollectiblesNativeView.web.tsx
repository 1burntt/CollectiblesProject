import * as React from 'react';

import { CollectiblesNativeViewProps } from './CollectiblesNative.types';

export default function CollectiblesNativeView(props: CollectiblesNativeViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
