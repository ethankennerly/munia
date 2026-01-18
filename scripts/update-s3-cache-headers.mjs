#!/usr/bin/env node
/**
 * Script to update Cache-Control headers for existing S3 objects.
 * This fixes Lighthouse cache lifetime warnings for images uploaded before
 * cache headers were added.
 *
 * Usage:
 *   node scripts/update-s3-cache-headers.mjs [--dry-run]
 *
 * Options:
 *   --dry-run  Preview changes without actually updating objects
 */

import { S3Client, ListObjectsV2Command, CopyObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// Validate required environment variables
const AWS_REGION = process.env.AWS_REGION;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

if (!AWS_REGION || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !BUCKET_NAME) {
  console.error('❌ Missing required environment variables:');
  if (!AWS_REGION) console.error('   - AWS_REGION');
  if (!S3_ACCESS_KEY_ID) console.error('   - S3_ACCESS_KEY_ID');
  if (!S3_SECRET_ACCESS_KEY) console.error('   - S3_SECRET_ACCESS_KEY');
  if (!BUCKET_NAME) console.error('   - S3_BUCKET_NAME');
  console.error('\nMake sure these are set in your environment or .env file.');
  console.error('You can source them with: export $(cat .env | xargs)');
  process.exit(1);
}

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

const CACHE_CONTROL = 'public, max-age=2592000'; // 30 days
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Check if object already has the correct cache control header
 */
async function hasCacheHeader(key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const response = await s3Client.send(command);
    return response.CacheControl === CACHE_CONTROL;
  } catch (error) {
    console.error(`Error checking ${key}:`, error.message);
    return false;
  }
}

/**
 * Update cache control header for a single object
 */
async function updateCacheHeader(key) {
  try {
    // First, get existing metadata to preserve it
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const headResponse = await s3Client.send(headCommand);

    // Copy object to itself with new cache control header
    // This is the standard way to update S3 object metadata
    const copyCommand = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${key}`,
      Key: key,
      CacheControl: CACHE_CONTROL,
      ContentType: headResponse.ContentType,
      MetadataDirective: 'REPLACE', // Required when updating metadata
      // Preserve other metadata if it exists
      Metadata: headResponse.Metadata || {},
    });

    await s3Client.send(copyCommand);
    return true;
  } catch (error) {
    console.error(`Error updating ${key}:`, error.message);
    return false;
  }
}

/**
 * List all objects in the bucket and update cache headers
 */
async function updateAllObjects() {
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE (updating objects)'}`);
  console.log(`Cache-Control: ${CACHE_CONTROL}\n`);

  let continuationToken = undefined;
  let totalObjects = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  do {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        ContinuationToken: continuationToken,
        MaxKeys: 1000, // Process in batches
      });

      const response = await s3Client.send(listCommand);
      const objects = response.Contents || [];

      console.log(`Processing batch of ${objects.length} objects...`);

      for (const object of objects) {
        totalObjects++;
        const key = object.Key;

        // Only process image/video files
        if (!/\.(jpg|jpeg|png|gif|webp|mp4|mov|avi)$/i.test(key)) {
          skippedCount++;
          continue;
        }

        // Check if already has correct header
        const alreadyHasHeader = await hasCacheHeader(key);

        if (alreadyHasHeader) {
          skippedCount++;
          continue;
        }

        if (DRY_RUN) {
          console.log(`  [DRY RUN] Would update: ${key}`);
          updatedCount++;
        } else {
          const success = await updateCacheHeader(key);
          if (success) {
            console.log(`  ✓ Updated: ${key}`);
            updatedCount++;
          } else {
            errorCount++;
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } catch (error) {
      console.error('Error listing objects:', error.message);
      process.exit(1);
    }
  } while (continuationToken);

  console.log('\n=== Summary ===');
  console.log(`Total objects: ${totalObjects}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped (already correct or not image/video): ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
}

// Run the script
updateAllObjects().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
