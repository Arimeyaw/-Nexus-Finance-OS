import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(userId: number) {
    const businessCount = await this.prisma.business.count({
      where: { members: { some: { userId } } },
    });

    const businessList = await this.prisma.business.findMany({
      where: { members: { some: { userId } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        currency: true,
        updatedAt: true,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    return {
      user,
      businessCount,
      businessList,
      summary: {
        activeBusinesses: businessCount,
        recentActivity: businessList.map((business) => ({
          id: business.id,
          label: business.name,
          updatedAt: business.updatedAt,
        })),
      },
    };
  }
}
