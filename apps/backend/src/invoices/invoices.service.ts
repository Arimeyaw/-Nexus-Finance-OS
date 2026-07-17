import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
  ) {}

  async createInvoice(userId: number, businessId: number, data: CreateInvoiceDto) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);

    const customer = await this.prisma.customer.findFirst({
      where: { id: data.customerId, businessId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found for this business.');
    }

    return this.prisma.invoice.create({
      data: {
        businessId,
        customerId: data.customerId,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        description: data.description,
        status: data.status || 'DRAFT',
      },
      include: { customer: true },
    });
  }

  async listInvoices(userId: number, businessId: number) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);
    return this.prisma.invoice.findMany({
      where: { businessId },
      orderBy: { updatedAt: 'desc' },
      include: {
        customer: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  async getInvoice(userId: number, businessId: number, invoiceId: number) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, businessId },
      include: {
        customer: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }
    return invoice;
  }

  async updateInvoice(
    userId: number,
    businessId: number,
    invoiceId: number,
    data: UpdateInvoiceDto,
  ) {
    await this.getInvoice(userId, businessId, invoiceId);
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amount: data.amount,
        description: data.description,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: { customer: true },
    });
  }

  async deleteInvoice(userId: number, businessId: number, invoiceId: number) {
    await this.getInvoice(userId, businessId, invoiceId);
    return this.prisma.invoice.delete({ where: { id: invoiceId } });
  }
}
