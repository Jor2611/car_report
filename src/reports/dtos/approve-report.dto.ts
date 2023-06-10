import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class ApproveReportDto {
  @IsBoolean()
  @ApiProperty({ example: true })
  approved: boolean;
}