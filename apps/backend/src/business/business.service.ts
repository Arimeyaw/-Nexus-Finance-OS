import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async createBusiness(userId: number, data: CreateBusinessDto) {
    const slug = data.slug?.trim().toLowerCase() || this.generateSlug(data.name);
    const existing = await this.prisma.business.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Business slug already exists.');
    }

    return this.prisma.business.create({
      data: {
        name: data.name,
        industry: data.industry,
        currency: data.currency || 'NGN',
        slug,
        owner: { connect: { id: userId } },
        members: {
          create: {
            user: { connect: { id: userId } },
            role: 'OWNER',
          },
        },
      },
      include: { owner: true, members: true },
    });
  }

  async findBusinessesForUser(userId: number) {
    return this.prisma.business.findMany({
      where: { members: { some: { userId } } },
      include: { owner: true },
    });
  }

  async ensureUserHasAccessToBusiness(userId: number, businessId: number) {
    const business = await this.prisma.business.findFirst({
      where: { id: businessId, members: { some: { userId } } },
      include: { owner: true },
    });
    if (!business) {
      throw new NotFoundException('Business not found or access denied.');
    }
    return business;
  }

  private generateSlug(name: string) {
    return `${name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}`;
  }
}
