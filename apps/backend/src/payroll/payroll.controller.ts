import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { RunPayrollDto } from './dto/run-payroll.dto';

@Controller('businesses/:businessId/payroll')
@ApiTags('Payroll')
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Post('employees')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create an employee for a business' })
  @ApiResponse({ status: 201, description: 'Employee created.' })
  async createEmployee(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() body: CreateEmployeeDto,
  ) {
    return this.payrollService.createEmployee(req.user.id, businessId, body);
  }

  @Get('employees')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List employees for a business' })
  @ApiResponse({ status: 200, description: 'Employees retrieved.' })
  async listEmployees(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
  ) {
    return this.payrollService.listEmployees(req.user.id, businessId);
  }

  @Post('salary-structures')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a salary structure for an employee' })
  @ApiResponse({ status: 201, description: 'Salary structure created.' })
  async createSalaryStructure(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() body: CreateSalaryStructureDto,
  ) {
    return this.payrollService.createSalaryStructure(req.user.id, businessId, body);
  }

  @Get('salary-structures')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List salary configurations for a business' })
  @ApiResponse({ status: 200, description: 'Salary structures retrieved.' })
  async listSalaryStructures(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
  ) {
    return this.payrollService.listSalaryStructures(req.user.id, businessId);
  }

  @Post('run')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Run payroll for a business and disburse salaries' })
  @ApiResponse({ status: 201, description: 'Payroll batch created.' })
  async runPayroll(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() body: RunPayrollDto,
  ) {
    return this.payrollService.runPayroll(req.user.id, businessId, body);
  }

  @Get('batches')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List payroll batches for a business' })
  @ApiResponse({ status: 200, description: 'Payroll batches retrieved.' })
  async listPayrollBatches(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
  ) {
    return this.payrollService.listPayrollBatches(req.user.id, businessId);
  }

  @Get('batches/:batchId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payroll batch details' })
  @ApiResponse({ status: 200, description: 'Payroll batch retrieved.' })
  async getPayrollBatch(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('batchId', ParseIntPipe) batchId: number,
  ) {
    return this.payrollService.getPayrollBatch(req.user.id, businessId, batchId);
  }
}
