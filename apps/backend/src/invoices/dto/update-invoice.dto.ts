import { IsNumber, IsString, IsOptional, IsDateString, Min, IsEnum } from 'class-validator';
import { InvoiceStatus } from './create-invoice.dto';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
