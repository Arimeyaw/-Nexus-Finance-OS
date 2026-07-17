import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class MoolreWebhookDto {
  @IsString()
  @IsNotEmpty()
  event!: string;

  @IsObject()
  @IsNotEmpty()
  data!: Record<string, any>;

  @IsString()
  @IsOptional()
  signature?: string;
}
