import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'Wai Municipal Council API',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  getRoot() {
    return {
      status: 'ok',
      message: 'Wai Municipal Council Backend API is active',
      timestamp: new Date().toISOString(),
    };
  }
}

