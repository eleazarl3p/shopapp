import { Test, TestingModule } from '@nestjs/testing';
import { GgdrvService } from './ggdrv.service';

describe('GgdrvService', () => {
  let service: GgdrvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GgdrvService],
    }).compile();

    service = module.get<GgdrvService>(GgdrvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
