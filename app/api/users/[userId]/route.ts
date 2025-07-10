import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, hasRequiredSystemRole } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { updateUserSchema, formatValidationErrors } from '@/lib/validation';

// PUT /api/users/[userId] - Update user (requires superadmin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !hasRequiredSystemRole(session.user.role, 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const body = await request.json();
    
    // Validate input
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: formatValidationErrors(validationResult.error) },
        { status: 400 }
      );
    }
    
    const { name, email, role, password, barAssignments = [] } = validationResult.data;

    // Prepare update data
    const updateData: Record<string, unknown> = {
      name,
      email,
      role,
    };

    // Hash password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Use transaction to update user and bar assignments
    const user = await prisma.$transaction(async (tx) => {
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: resolvedParams.userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        }
      });

      // Update bar assignments
      // First, delete existing assignments
      await tx.userBar.deleteMany({
        where: { userId: resolvedParams.userId }
      });

      // Then create new assignments
      if (barAssignments.length > 0) {
        await tx.userBar.createMany({
          data: barAssignments.map((assignment: Record<string, unknown>) => ({
            userId: resolvedParams.userId,
            barId: assignment.barId as string,
            role: (assignment.role as string) || 'staff',
          })),
        });
      }

      return updatedUser;
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[userId] - Delete user (requires superadmin)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !hasRequiredSystemRole(session.user.role, 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Don't allow deleting yourself
    if (resolvedParams.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: resolvedParams.userId }
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}