import { IsInt, IsString, IsOptional, IsDateString, Min, IsEnum, IsNumber } from 'class-validator';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
}

export class CreateInvoiceDto {
  @IsInt()
  customerId!: number;

  @IsDateString()
  dueDate!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;
}
