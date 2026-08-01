import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
  ) {}

  async createExpense(userId: number, businessId: number, data: CreateExpenseDto) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);

    return this.prisma.expense.create({
      data: {
        businessId,
        description: data.description,
        amount: data.amount,
        currency: data.currency ?? 'GHS',
        category: data.category,
        expenseDate: new Date(data.expenseDate),
        paymentMethod: data.paymentMethod,
        status: data.status ?? 'PENDING',
        notes: data.notes,
      },
    });
  }

  async listExpenses(userId: number, businessId: number) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);
    return this.prisma.expense.findMany({
      where: { businessId },
      orderBy: { expenseDate: 'desc' },
    });
  }
}
