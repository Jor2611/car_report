import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { Roles } from "../roles.enum";

export class AccountDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;
  
  @Expose()
  @ApiProperty({ example: 'test@test.com' })
  email: string;

  @Expose()
  @ApiProperty({ enum: ['admin','user'] })
  role: Roles;
}