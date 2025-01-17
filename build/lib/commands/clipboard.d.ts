import { FlutterDriver } from '../driver';
/**
 * Set clipboard content via each native app driver
 * @param this the FlutterDriver
 * @param content the content to get the clipboard
 * @param contentType the contentType to set the data type
 */
export declare const setClipboard: (this: FlutterDriver, content: string, contentType: string) => Promise<void>;
/**
 * Get the clipboard content via each native app driver
 * @param this the FlutterDriver
 * @param contentType the contentType to set the data type
 */
export declare const getClipboard: (this: FlutterDriver, contentType: string) => Promise<void>;
//# sourceMappingURL=clipboard.d.ts.map