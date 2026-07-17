import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
  ) {}

  async createCustomer(userId: number, businessId: number, data: CreateCustomerDto) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);
    return this.prisma.customer.create({
      data: {
        businessId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        currency: data.currency || 'NGN',
      },
    });
  }

  async listCustomers(userId: number, businessId: number) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);
    return this.prisma.customer.findMany({
      where: { businessId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getCustomer(userId: number, businessId: number, customerId: number) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, businessId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }
    return customer;
  }

  async updateCustomer(
    userId: number,
    businessId: number,
    customerId: number,
    data: UpdateCustomerDto,
  ) {
    await this.getCustomer(userId, businessId, customerId);
    return this.prisma.customer.update({
      where: { id: customerId },
      data,
    });
  }

  async deleteCustomer(userId: number, businessId: number, customerId: number) {
    await this.getCustomer(userId, businessId, customerId);
    return this.prisma.customer.delete({ where: { id: customerId } });
  }
}
