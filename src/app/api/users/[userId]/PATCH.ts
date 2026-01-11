/**
 * PATCH /api/users/:userId
 * Allows an authenticated user to update their information.
 */
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/prisma';
import { Prisma } from '@prisma/client';
import { getServerUser } from '@/lib/getServerUser';
import { userAboutSchema } from '@/lib/validations/userAbout';
import { toGetUser } from '@/lib/prisma/toGetUser';
import { includeToUser } from '@/lib/prisma/includeToUser';
import { logger } from '@/lib/logging';

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const [user] = await getServerUser();
  const { userId } = await params;
  if (!user || user.id !== userId) return NextResponse.json({}, { status: 401 });

  const userAbout = await request.json();
  logger.info({
    msg: 'profile_update_request',
    userId: user.id,
    incomingBirthDate: userAbout.birthDate,
    incomingData: userAbout,
  });

  const validate = userAboutSchema.safeParse(userAbout);
  if (validate.success) {
    try {
      const birthDateValue = validate.data.birthDate ? new Date(validate.data.birthDate) : null;
      logger.info({
        msg: 'profile_update_db_save',
        userId: user.id,
        birthDateInput: validate.data.birthDate,
        birthDateParsed: birthDateValue?.toISOString() || null,
      });

      const res = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          ...validate.data,
          birthDate: birthDateValue,
        },
        include: includeToUser(user.id),
      });

      logger.info({
        msg: 'profile_update_db_result',
        userId: user.id,
        dbBirthDate: res.birthDate?.toISOString() || null,
      });

      const updatedUser = toGetUser(res);

      logger.info({
        msg: 'profile_update_api_response',
        userId: user.id,
        responseBirthDate: updatedUser.birthDate?.toISOString() || null,
        responseBirthDateType: typeof updatedUser.birthDate,
      });

      return NextResponse.json(updatedUser);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          if (e.meta) {
            const field = (e.meta.target as string[])[0];
            const error = {
              field,
              message: `This ${field} is already taken.`,
            };
            return NextResponse.json(error, { status: 409 });
          }
        }
        return NextResponse.json({ errorMessage: 'Database (prisma) error.' }, { status: 502 });
      }
    }
  } else {
    return NextResponse.json({ errorMessage: validate.error.issues[0].message }, { status: 400 });
  }
}
