import { NestInterceptor, ExecutionContext, CallHandler, UseInterceptors } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

interface IClassConstructor {
  new (...args: any[]): {}
}

export function Serialize(dto: IClassConstructor){
  return UseInterceptors(new SerializeInterceptor(dto))
}

class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: IClassConstructor){}
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true
        })
      })
    )    
  }
}