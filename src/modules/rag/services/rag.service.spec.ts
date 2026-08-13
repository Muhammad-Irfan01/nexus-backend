import { Test, TestingModule } from '@nestjs/testing';
import { RagService } from './rag.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { RetrivalService } from './retrieval.service';
import { PromptBuilderService } from './prompt-builder.service';
import { UsageTrackerService } from '../../analytics/services/usage-tracker.service';

describe('RagService', () => {
  let service: RagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagService,
        { provide: PrismaService, useValue: { document: { findMany: jest.fn().mockResolvedValue([]) } } },
        { provide: RetrivalService, useValue: { retrive: jest.fn() } },
        { provide: PromptBuilderService, useValue: { builderPrompt: jest.fn() } },
        { provide: UsageTrackerService, useValue: { track: jest.fn() } },
      ],
    }).compile();

    service = module.get<RagService>(RagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
