import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const apkPath = path.join(process.cwd(), 'public', 'apk', 'client.apk');

        console.log('[APK Download] Attempting to serve APK from:', apkPath);

        // Check if file exists
        if (!fs.existsSync(apkPath)) {
            console.error('[APK Download] File not found at:', apkPath);
            return NextResponse.json(
                { error: 'APK file not found', path: apkPath },
                { status: 404 }
            );
        }

        // Get file stats
        const stats = fs.statSync(apkPath);
        console.log('[APK Download] File found, size:', stats.size, 'bytes');

        // Create read stream for large file
        const fileStream = fs.createReadStream(apkPath);
        const readableStream = new ReadableStream({
            start(controller) {
                fileStream.on('data', (chunk: Buffer) => {
                    controller.enqueue(new Uint8Array(chunk));
                });
                fileStream.on('end', () => {
                    controller.close();
                });
                fileStream.on('error', (error: Error) => {
                    console.error('[APK Download] Stream error:', error);
                    controller.error(error);
                });
            },
        });

        console.log('[APK Download] Streaming APK file...');

        // Return the file with appropriate headers
        return new NextResponse(readableStream, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.android.package-archive',
                'Content-Disposition': 'attachment; filename="client.apk"',
                'Content-Length': stats.size.toString(),
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch (error) {
        console.error('[APK Download] Error serving APK:', error);
        return NextResponse.json(
            {
                error: 'Failed to serve APK file',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
