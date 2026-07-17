import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateBusinessDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/i, { message: 'Slug can only contain letters, numbers, and hyphens.' })
  slug?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}
