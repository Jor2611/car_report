import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";
import { Roles } from "../roles.enum";

export class CreateAccountDto {
  @ApiProperty({ example: 'test@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'test123456' })
  @IsString()
  password: string;

  @ApiProperty({ enum: ['admin', 'user'] })
  @IsString()
  role: Roles;
}