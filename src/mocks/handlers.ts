import { getAnalyzeMock } from '../api/generated/analyze/analyze.msw';
import { getConfigMock } from '../api/generated/config/config.msw';
import { getTalismansMock } from '../api/generated/talismans/talismans.msw';
import { getVisionMock } from '../api/generated/vision/vision.msw';

export const handlers = [
  ...getAnalyzeMock(),
  ...getConfigMock(),
  ...getTalismansMock(),
  ...getVisionMock(),
];
