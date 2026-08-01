import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
  ) {}

  async getReport(userId: number, businessId: number) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);

    const [invoices, expenses, payments, customers] = await Promise.all([
      this.prisma.invoice.findMany({ where: { businessId } }),
      this.prisma.expense.findMany({ where: { businessId } }),
      this.prisma.payment.findMany({ where: { businessId } }),
      this.prisma.customer.count({ where: { businessId } }),
    ]);

    const totalRevenue = payments.reduce(
      (sum: number, payment: { amount: number }) => sum + payment.amount,
      0,
    );
    const totalExpenses = expenses.reduce(
      (sum: number, expense: { amount: number }) => sum + expense.amount,
      0,
    );
    const outstandingInvoices = invoices
      .filter((invoice: { status: string; amount: number }) => invoice.status !== 'PAID')
      .reduce((sum: number, invoice: { amount: number }) => sum + invoice.amount, 0);

    return {
      totalRevenue,
      totalExpenses,
      netCashFlow: totalRevenue - totalExpenses,
      outstandingInvoices,
      customerCount: customers,
      invoices,
      expenses,
      payments,
    };
  }
}
