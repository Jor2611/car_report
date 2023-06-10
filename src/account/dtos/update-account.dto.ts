import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";
import { Roles } from "../roles.enum";

export class UpdateAccountDto {
  @ApiProperty({ example: 'test@test.com' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ example: 'test123456' })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({ enum: ['admin', 'user'] })
  @IsString()
  @IsOptional()
  role: Roles;
}