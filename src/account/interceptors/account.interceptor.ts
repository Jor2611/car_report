import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { Observable } from "rxjs";
import { Account } from "../account.entity";

declare global {
  namespace Express {
    interface Request {
      account?: Account
    }
  }
}

@Injectable()
export class AccountInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    if(request.user){
      request.account = plainToInstance(Account, request.user);
      delete request.user;
    }
    return next.handle();
  }
}