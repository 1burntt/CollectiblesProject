import { requireNativeView } from 'expo';
import * as React from 'react';

import { CollectiblesNativeViewProps } from './CollectiblesNative.types';

const NativeView: React.ComponentType<CollectiblesNativeViewProps> =
  requireNativeView('CollectiblesNative');

export default function CollectiblesNativeView(props: CollectiblesNativeViewProps) {
  return <NativeView {...props} />;
}
