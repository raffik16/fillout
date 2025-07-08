import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, hasRequiredSystemRole } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

// PUT /api/users/[userId] - Update user (requires superadmin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !hasRequiredSystemRole(session.user.role, 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, role, password, barAssignments = [] } = body;

    // Prepare update data
    const updateData: Record<string, any> = {
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
        where: { id: params.userId },
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
        where: { userId: params.userId }
      });

      // Then create new assignments
      if (barAssignments.length > 0) {
        await tx.userBar.createMany({
          data: barAssignments.map((assignment: any) => ({
            userId: params.userId,
            barId: assignment.barId,
            role: assignment.role || 'staff',
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
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !hasRequiredSystemRole(session.user.role, 'superadmin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Don't allow deleting yourself
    if (params.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: params.userId }
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