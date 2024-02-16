import type { PrismaClient } from '@prisma/client';
import type { DeepMockProxy } from 'jest-mock-extended';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mockDeep, mockReset } from 'jest-mock-extended';

import prisma from './prisma-client';

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

jest.mock('./prisma-client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});
