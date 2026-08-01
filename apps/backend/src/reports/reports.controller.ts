import { Controller, Get, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('businesses/:businessId/reports')
@ApiTags('Reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate a finance summary report for a business' })
  @ApiResponse({ status: 200, description: 'Business financial report.' })
  async getReport(
    @Request() req: { user: { id: number } },
    @Param('businessId', ParseIntPipe) businessId: number,
  ) {
    return this.reportsService.getReport(req.user.id, businessId);
  }
}
