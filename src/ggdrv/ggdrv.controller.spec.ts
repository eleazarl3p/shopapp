import { Test, TestingModule } from '@nestjs/testing';
import { GgdrvController } from './ggdrv.controller';
import { GgdrvService } from './ggdrv.service';

describe('GgdrvController', () => {
  let controller: GgdrvController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GgdrvController],
      providers: [GgdrvService],
    }).compile();

    controller = module.get<GgdrvController>(GgdrvController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
