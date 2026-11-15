import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';

import { UsersService } from './users.service.js';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';

import type { AuthUser } from '../../types/auth.js';
import {
  UpdateProfileSchema,
  type UpdateProfileDto,
} from './dto/update-profile.dto.js';
import {
  ChangePasswordSchema,
  type ChangePasswordDto,
} from './dto/change-password.dto.js';
import {
  UpdateSettingsSchema,
  type UpdateSettingsDto,
} from './dto/update-settings.dto.js';
import {
  DeleteAccountSchema,
  type DeleteAccountDto,
} from './dto/delete-account.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.getProfile(user.userId);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateProfileSchema)) dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(ChangePasswordSchema)) dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.userId, dto);
  }

  @Get('me/settings')
  getSettings(@CurrentUser() user: AuthUser) {
    return this.usersService.getSettings(user.userId);
  }

  @Patch('me/settings')
  updateSettings(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(UpdateSettingsSchema)) dto: UpdateSettingsDto,
  ) {
    return this.usersService.updateSettings(user.userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  deleteAccount(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(DeleteAccountSchema)) dto: DeleteAccountDto,
  ) {
    return this.usersService.deleteAccount(user.userId, dto.password);
  }
}
