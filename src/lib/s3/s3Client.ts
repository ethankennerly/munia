import 'server-only';
import { S3Client } from '@aws-sdk/client-s3';
import { logger } from '@/lib/logging';

// https://github.com/aws/aws-sdk-net/issues/1713
const s3ClientParams = {
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
};
logger.debug({
  msg: 's3_credentials_length',
  accessKeyLen: s3ClientParams.credentials.accessKeyId.length,
  secretKeyLen: s3ClientParams.credentials.secretAccessKey.length,
});
export const s3Client = new S3Client(s3ClientParams);
