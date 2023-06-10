import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";

export class ReportDto{
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 25000 })
  price: number;
  
  @Expose()
  @ApiProperty({ example: 1998 })
  year: number;
  
  @Expose()
  @ApiProperty({ example: 30.11111 })
  lng: number;
  
  @Expose()
  @ApiProperty({ example: -10.0035 })
  lat: number;
  
  @Expose()
  @ApiProperty({ example: 'Toyota' })
  make: string;
  
  @Expose()
  @ApiProperty({ example: 'Corolla' })
  model: string;
  
  @Expose()
  @ApiProperty({ example: 15000 })
  mileage: number;

  @Expose()
  @ApiProperty({ example: false })
  approved: boolean;

  @Transform(({ obj }) => obj.owner.id)
  @Expose()
  @ApiProperty({ example: 12 })
  ownerId:number;
}