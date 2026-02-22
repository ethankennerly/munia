import 'server-only';

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logging';
import prisma from '@/lib/prisma/prisma';
import { v4 as uuid } from 'uuid';
import { uploadObject } from '@/lib/s3/uploadObject';
import { fileNameToUrl } from '@/lib/s3/fileNameToUrl';
import { getServerUser } from '@/lib/getServerUser';
import { resizePhoto } from '@/lib/resizePhoto';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
export async function useUpdateProfileAndCoverPhoto({
  request,
  userIdParam,
  toUpdate,
}: {
  request: Request;
  userIdParam: string;
  toUpdate: 'profilePhoto' | 'coverPhoto';
}) {
  const [user] = await getServerUser();
  if (!user || user.id !== userIdParam) {
    return NextResponse.json({}, { status: 401 });
  }
  const userId = user.id;

  const formData = await request.formData();
  const file = formData.get('file') as Blob | null;

  if (!file) {
    return NextResponse.json({ error: 'File blob is required.' }, { status: 400 });
  }

  try {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    // Resize and crop to max dimensions before uploading
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const { buffer, mimeType, extension } = await resizePhoto(rawBuffer, toUpdate);

    // Upload image to S3
    const fileName = `${Date.now()}-${uuid()}.${extension}`;
    await uploadObject(buffer, fileName, mimeType);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        [toUpdate]: fileName,
      },
    });

    await prisma.post.create({
      data: {
        userId,
        content: toUpdate === 'profilePhoto' ? '#NewProfilePhoto' : '#NewCoverPhoto',
        visualMedia: {
          create: [
            {
              userId,
              fileName,
              type: 'PHOTO',
            },
          ],
        },
      },
    });

    const uploadedTo = fileNameToUrl(fileName);

    return NextResponse.json({ uploadedTo });
  } catch (error) {
    logger.error({ msg: 'update_profile_or_cover_error', err: (error as Error)?.message || 'unknown' });
    // Log lengths of credentials without exposing secrets (non-PII)
    logger.debug({
      msg: 's3_credentials_length',
      accessKeyLen: process.env.S3_ACCESS_KEY_ID?.length ?? null,
      secretKeyLen: process.env.S3_SECRET_ACCESS_KEY?.length ?? null,
    });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
