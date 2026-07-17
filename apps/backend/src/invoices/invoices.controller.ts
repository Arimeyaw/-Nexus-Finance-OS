import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('businesses/:businessId/invoices')
@ApiTags('Invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create an invoice for a business' })
  @ApiResponse({ status: 201, description: 'Invoice created.' })
  async create(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() body: CreateInvoiceDto,
  ) {
    return this.invoicesService.createInvoice(req.user.id, businessId, body);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List invoices for a business' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved.' })
  async list(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
  ) {
    return this.invoicesService.listInvoices(req.user.id, businessId);
  }

  @Get(':invoiceId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved.' })
  async get(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('invoiceId', ParseIntPipe) invoiceId: number,
  ) {
    return this.invoicesService.getInvoice(req.user.id, businessId, invoiceId);
  }

  @Patch(':invoiceId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated.' })
  async update(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('invoiceId', ParseIntPipe) invoiceId: number,
    @Body() body: UpdateInvoiceDto,
  ) {
    return this.invoicesService.updateInvoice(req.user.id, businessId, invoiceId, body);
  }

  @Delete(':invoiceId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted.' })
  async delete(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('invoiceId', ParseIntPipe) invoiceId: number,
  ) {
    return this.invoicesService.deleteInvoice(req.user.id, businessId, invoiceId);
  }
}
