import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthContext, isRecord, pickString } from '@/lib/server/users-roles';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ userId: string }>;
};

const findUserByIdentifier = async (organizationId: string, userId: string) => {
  const byUserId = await prisma.organizationUser.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (byUserId) {
    return byUserId;
  }

  return prisma.organizationUser.findFirst({
    where: {
      organizationId,
      id: userId,
    },
  });
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params;
    const rawBody: unknown = await request.json().catch(() => ({}));
    const body = isRecord(rawBody) ? rawBody : {};
    const { organizationId } = getAuthContext(request);

    const newEmail = pickString(body, 'NewEmail', 'newEmail', 'email')?.toLowerCase();
    if (!newEmail) {
      return NextResponse.json({ message: 'New email is required.' }, { status: 400 });
    }

    const existingUser = await findUserByIdentifier(organizationId, userId);
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const duplicate = await prisma.organizationUser.findFirst({
      where: {
        organizationId,
        email: newEmail,
        id: { not: existingUser.id },
      },
    });

    if (duplicate) {
      return NextResponse.json({ message: 'Email already exists for this tenant.' }, { status: 409 });
    }

    await prisma.organizationUser.update({
      where: { id: existingUser.id },
      data: { email: newEmail },
    });

    return NextResponse.json({
      success: true,
      message: 'Email updated successfully.',
    });
  } catch (error) {
    console.error('PATCH /api/users/[userId]/email failed', error);
    return NextResponse.json({ message: 'Failed to update email.' }, { status: 500 });
  }
}
