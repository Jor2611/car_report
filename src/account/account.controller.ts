import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Patch, 
  Post,
  HttpCode
} from '@nestjs/common';
import { 
  ApiBadRequestResponse, 
  ApiBearerAuth, 
  ApiBody, 
  ApiCreatedResponse, 
  ApiNoContentResponse, 
  ApiNotFoundResponse, 
  ApiOkResponse, 
  ApiParam, 
  ApiTags 
} from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dtos/create-account.dto';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AccountDto } from './dtos/account.dto';
import { LoginAccountDto } from './dtos/login-account.dto';
import { Public } from '../decorators/public.decorator';
import { TokenDto } from './dtos/token.dto';
import { Role } from './decorators/roles.decorator';
import { Roles } from './roles.enum';


@ApiTags('Accounts')
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService){}
  
  @Get('/:id')
  @Role([Roles.Admin,Roles.User])
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, example: '1' })
  @ApiNotFoundResponse({ description: 'Account not found!' })
  @ApiOkResponse({ type: AccountDto })
  @Serialize(AccountDto)
  fetchAccount(@Param('id') id: string){
    return this.accountService.findOne(parseInt(id));
  }

  @Public()
  @Post('/signup')
  @HttpCode(201)
  @ApiBody({ type: CreateAccountDto })
  @ApiCreatedResponse({ type: TokenDto })
  @ApiBadRequestResponse({ description: 'Account with this email already exists!' })
  @Serialize(TokenDto)
  async signup(@Body() body: CreateAccountDto){
    return this.accountService.signup(body.email, body.password, body.role);
  }

  @Public()
  @Post('/signin')
  @HttpCode(200)
  @ApiBody({ type: LoginAccountDto })
  @ApiOkResponse({ type: TokenDto })
  @ApiBadRequestResponse({ description: 'Wrong credentials!' })
  @Serialize(TokenDto)
  async signin(@Body() body: LoginAccountDto){
    return this.accountService.signin(body.email, body.password);
  }

  @Patch('/:id')
  @Role([Roles.Admin,Roles.User])
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, example: '1' })
  @ApiBody({ type: UpdateAccountDto })
  @ApiOkResponse({ type: AccountDto })
  @ApiNotFoundResponse({ description: 'Account not found!' })
  @Serialize(AccountDto)
  async updateAccount(@Param('id') id: string, @Body() body: UpdateAccountDto){
    return this.accountService.update(parseInt(id), body);
  }
  
  @Delete('/:id')
  @Role([Roles.Admin])
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, example: '1' })
  @ApiNotFoundResponse({ description: 'Account not found!' })
  @ApiNoContentResponse()
  async removeAccount(@Param('id') id: string){
    return this.accountService.remove(parseInt(id));
  }
}
