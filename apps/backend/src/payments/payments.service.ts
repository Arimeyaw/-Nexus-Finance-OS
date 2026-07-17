import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessService } from '../business/business.service';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
  ) {}

  async createPaymentLink(userId: number, businessId: number, data: CreatePaymentLinkDto) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);

    const invoice = await this.prisma.invoice.findFirst({
      where: { id: data.invoiceId, businessId },
      include: { customer: true },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found for this business.');
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Invoice is already paid.');
    }

    const paymentReference = `inv-${invoice.id}-${Date.now()}`;
    const paymentLink = await this.createMoolrePaymentLink({
      amount: data.amount,
      currency: data.currency,
      customerEmail: invoice.customer.email,
      invoiceId: invoice.id,
      description: data.description ?? invoice.description ?? `Payment for invoice #${invoice.id}`,
      reference: paymentReference,
    });

    return this.prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        businessId,
        customerId: invoice.customerId,
        amount: data.amount,
        currency: data.currency,
        moolrePaymentId: paymentLink.paymentId,
        paymentReference: paymentReference,
        paymentLink: paymentLink.paymentUrl,
        status: 'PENDING',
        expiresAt: paymentLink.expiresAt ? new Date(paymentLink.expiresAt) : undefined,
      },
    });
  }

  async getBusinessPayments(userId: number, businessId: number) {
    await this.businessService.ensureUserHasAccessToBusiness(userId, businessId);
    return this.prisma.payment.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: { invoice: true, customer: true },
    });
  }

  async handleWebhook(payload: any, signature?: string) {
    const event = payload.event;
    const data = payload.data;
    if (!event || !data) {
      throw new BadRequestException('Invalid webhook payload.');
    }

    const paymentId = data.paymentId ?? data.id;
    if (!paymentId) {
      throw new BadRequestException('Missing payment identifier in webhook payload.');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { moolrePaymentId: paymentId },
      include: { invoice: true },
    });
    if (!payment) {
      this.logger.warn(`Received webhook for unknown Moolre payment id ${paymentId}`);
      return { status: 'ignored' };
    }

    const status = this.mapMoolreStatus(data.status ?? event);
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        externalStatus: data.status ?? event,
        paidAt: status === 'COMPLETED' ? new Date() : undefined,
        webhookPayload: data,
      },
    });

    if (status === 'COMPLETED' && payment.invoice) {
      await this.reconcileInvoice(payment.invoice.id, payment.amount);
    }

    return updatedPayment;
  }

  private async reconcileInvoice(invoiceId: number, paymentAmount: number) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found for reconciliation.');
    }
    if (paymentAmount >= invoice.amount) {
      return this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID' },
      });
    }
    return invoice;
  }

  private async createMoolrePaymentLink(args: {
    amount: number;
    currency: string;
    customerEmail: string;
    invoiceId: number;
    description: string;
    reference: string;
  }) {
    const baseUrl = process.env.MOOLRE_API_URL ?? 'https://api.moolre.com';
    const secret = process.env.MOOLRE_API_SECRET;
    if (!secret) {
      throw new Error('MOOLRE_API_SECRET is not configured.');
    }

    const redirectUrl = process.env.MOOLRE_REDIRECT_URL;
    const webhookUrl = process.env.MOOLRE_WEBHOOK_URL;
    if (!redirectUrl || !webhookUrl) {
      throw new Error('MOOLRE_REDIRECT_URL and MOOLRE_WEBHOOK_URL must be configured.');
    }

    const payload = {
      amount: args.amount,
      currency: args.currency,
      customer: { email: args.customerEmail },
      metadata: {
        invoiceId: args.invoiceId,
        reference: args.reference,
      },
      description: args.description,
      redirect_url: redirectUrl,
      callback_url: webhookUrl,
      reference: args.reference,
    };

    const response = await fetch(`${baseUrl}/collections/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Moolre payment link creation failed: ${body}`);
      throw new Error('Failed to create payment link with Moolre.');
    }

    const data = await response.json();
    return {
      paymentId: data.id,
      paymentUrl: data.payment_url,
      expiresAt: data.expires_at,
    };
  }

  private mapMoolreStatus(status: string) {
    const normalized = status.toUpperCase();
    switch (normalized) {
      case 'COMPLETED':
      case 'PAID':
      case 'SUCCESS':
        return 'COMPLETED';
      case 'FAILED':
      case 'CANCELED':
        return 'FAILED';
      case 'EXPIRED':
        return 'EXPIRED';
      case 'PENDING':
      default:
        return 'PENDING';
    }
  }
}
