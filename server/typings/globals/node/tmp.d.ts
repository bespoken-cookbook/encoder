declare module "tmp" {
    export interface FileOptions {
            prefix?: string;
            postfix?: string;
            mode?: number;
            keep?: boolean;
    }

    export function file(options?: FileOptions, fileCreatedCallback?: (error: Error, inputPath: string, fileDescriptor: number, cleanupCallback: () => void) => void): void;
    export function tmpName(options?: FileOptions, nameCreatedCallback?: (error: Error, outputPath: string) => void) : void;
}