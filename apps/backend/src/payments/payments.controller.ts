import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { MoolreWebhookDto } from './dto/moolre-webhook.dto';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('businesses/:businessId/payments')
@ApiTags('Payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('links')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a secure Moolre payment link for an invoice' })
  @ApiResponse({ status: 201, description: 'Payment link created.' })
  async createPaymentLink(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() body: CreatePaymentLinkDto,
  ) {
    return this.paymentsService.createPaymentLink(req.user.id, businessId, body);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List payments for a business' })
  @ApiResponse({ status: 200, description: 'Payments retrieved.' })
  async listPayments(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
  ) {
    return this.paymentsService.getBusinessPayments(req.user.id, businessId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Receive Moolre webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed.' })
  async receiveWebhook(
    @Body() body: MoolreWebhookDto,
    @Headers('x-moolre-signature') signature?: string,
  ) {
    return this.paymentsService.handleWebhook(body, signature);
  }
}
