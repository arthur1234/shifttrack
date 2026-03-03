import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('api/v1/health')
  health() {
    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  }
}
