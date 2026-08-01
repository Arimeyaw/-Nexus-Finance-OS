import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { RunPayrollDto } from './dto/run-payroll.dto';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
  ) {}

  async createEmployee(userId: number, businessId: number, data: CreateEmployeeDto) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);

    return this.prisma.employee.create({
      data: {
        businessId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
      },
    });
  }

  async listEmployees(userId: number, businessId: number) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);
    return this.prisma.employee.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSalaryStructure(userId: number, businessId: number, data: CreateSalaryStructureDto) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);

    const employee = await this.prisma.employee.findFirst({
      where: { id: data.employeeId, businessId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found for this business.');
    }

    return this.prisma.salaryStructure.create({
      data: {
        businessId,
        employeeId: data.employeeId,
        baseSalary: data.baseSalary,
        bonus: data.bonus ?? 0,
        allowances: data.allowances ?? 0,
        deductions: data.deductions ?? 0,
        currency: data.currency,
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
      },
    });
  }

  async listSalaryStructures(userId: number, businessId: number) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);
    return this.prisma.salaryStructure.findMany({
      where: { businessId },
      orderBy: { effectiveFrom: 'desc' },
      include: { employee: true },
    });
  }

  async runPayroll(userId: number, businessId: number, data: RunPayrollDto) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);

    const employees = await this.prisma.employee.findMany({ where: { businessId } });
    const salaryStructures = await this.prisma.salaryStructure.findMany({
      where: { businessId },
      orderBy: { effectiveFrom: 'desc' },
    });

    if (!employees.length) {
      throw new BadRequestException('No employees available for payroll processing.');
    }

    const batch = await this.prisma.payrollBatch.create({
      data: {
        businessId,
        period: data.period,
        status: 'PENDING',
        totalAmount: 0,
        currency:
          (await this.prisma.business.findUnique({ where: { id: businessId } }))?.currency ?? 'NGN',
      },
    });

    const payments = [] as Array<{ employeeId: number; amount: number }>;
    for (const employee of employees) {
      const structure = salaryStructures.find((entry) => entry.employeeId === employee.id);
      const grossAmount = structure?.baseSalary ?? 0;
      const netAmount = Math.max(
        0,
        grossAmount +
          (structure?.bonus ?? 0) +
          (structure?.allowances ?? 0) -
          (structure?.deductions ?? 0),
      );
      payments.push({ employeeId: employee.id, amount: netAmount });
    }

    const totalAmount = payments.reduce((sum, entry) => sum + entry.amount, 0);

    await this.prisma.payrollBatch.update({
      where: { id: batch.id },
      data: { totalAmount, status: 'PROCESSING' },
    });

    for (const payment of payments) {
      await this.prisma.payrollPayment.create({
        data: {
          businessId,
          payrollBatchId: batch.id,
          employeeId: payment.employeeId,
          amount: payment.amount,
          currency:
            (await this.prisma.business.findUnique({ where: { id: businessId } }))?.currency ??
            'NGN',
          status: 'PENDING',
        },
      });
    }

    return this.prisma.payrollBatch.findUnique({
      where: { id: batch.id },
      include: { payments: true },
    });
  }

  async listPayrollBatches(userId: number, businessId: number) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);
    return this.prisma.payrollBatch.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: { payments: true },
    });
  }

  async getPayrollBatch(userId: number, businessId: number, batchId: number) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);
    const batch = await this.prisma.payrollBatch.findFirst({
      where: { id: batchId, businessId },
      include: { payments: true },
    });
    if (!batch) {
      throw new NotFoundException('Payroll batch not found.');
    }
    return batch;
  }
}
