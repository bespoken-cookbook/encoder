import * as path from "path";

/**
 * Returns the file name stripped of the extension and path.
 * 
 * @param filePath - full path of the file.
 * @return The name of the file or null if the filePath was null.
 */
export function fileName(filePath: string): string {
    return (filePath) ? path.basename(filePath, extension(filePath)) : null;
}

/**
 * Returns the file extension if there is one.
 * 
 * @param filePath - full path of the file.
 * @param fallback - optional fallback for when the extension is not available. 
 * @return The extension of the file or the fallback if the filePath was null or if there was not an extension.
 */
export function extension(filePath: string, fallback?: string): string {
    var indexOfDot: number = (filePath) ? filePath.lastIndexOf(".") : -1;
    return (indexOfDot >= 0) ? filePath.substr(filePath.lastIndexOf(".")) : fallback;
} 