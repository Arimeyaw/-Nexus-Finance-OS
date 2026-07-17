import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  name?: string;

  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
