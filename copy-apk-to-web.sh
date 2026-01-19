#!/bin/bash
# Script to copy APK from mobile container to web container
# Run this after building the APK

set -e

echo "📱 Copying APK from mobile to web container..."

# Copy from mobile container to temp
docker exec area_mobile cp /app/build/outputs/client.apk /tmp/client.apk
docker cp area_mobile:/tmp/client.apk /tmp/client.apk

# Copy to web container
docker cp /tmp/client.apk area_web:/app/public/client.apk

# Verify
SIZE=$(docker exec area_web ls -lh /app/public/client.apk | awk '{print $5}')
echo "✅ APK copied successfully! Size: $SIZE"
echo "🌐 APK available at: http://localhost:8081/client.apk"

# Cleanup
rm -f /tmp/client.apk
