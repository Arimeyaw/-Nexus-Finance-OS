import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('businesses/:businessId/customers')
@ApiTags('Customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a customer for a business' })
  @ApiResponse({ status: 201, description: 'Customer created.' })
  async create(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() body: CreateCustomerDto,
  ) {
    return this.customersService.createCustomer(req.user.id, businessId, body);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List customers for a business' })
  @ApiResponse({ status: 200, description: 'Customers retrieved.' })
  async list(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
  ) {
    return this.customersService.listCustomers(req.user.id, businessId);
  }

  @Get(':customerId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a customer' })
  @ApiResponse({ status: 200, description: 'Customer retrieved.' })
  async get(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.customersService.getCustomer(req.user.id, businessId, customerId);
  }

  @Patch(':customerId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({ status: 200, description: 'Customer updated.' })
  async update(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() body: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(req.user.id, businessId, customerId, body);
  }

  @Delete(':customerId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted.' })
  async delete(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('customerId', ParseIntPipe) customerId: number,
  ) {
    return this.customersService.deleteCustomer(req.user.id, businessId, customerId);
  }
}
