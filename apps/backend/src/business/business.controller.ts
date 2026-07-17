import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBusinessDto } from './dto/create-business.dto';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('businesses')
@ApiTags('Business')
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a business and onboard the current user.' })
  @ApiResponse({ status: 201, description: 'Business created.' })
  async create(@Request() req: { user: { id: number } }, @Body() body: CreateBusinessDto) {
    return this.businessService.createBusiness(req.user.id, body);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List businesses for current user.' })
  @ApiResponse({ status: 200, description: 'Businesses retrieved.' })
  async list(@Request() req: { user: { id: number } }) {
    return this.businessService.findBusinessesForUser(req.user.id);
  }
}
