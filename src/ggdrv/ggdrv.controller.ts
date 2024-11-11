import { Controller } from '@nestjs/common';
import { GgdrvService } from './ggdrv.service';

@Controller('ggdrv')
export class GgdrvController {
  constructor(private readonly ggdrvService: GgdrvService) {}
}
