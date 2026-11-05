import { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  beforeEach, describe, expect, test, vi,
} from 'vitest';
import { TrainingFailed } from './TrainingFailed';

const mockUiConfig: { trainingFailedRedirectURL?: string } = {};

vi.mock('@mantine/core', () => ({
  Text: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../storage/storageEngineHooks', () => ({
  useStorageEngine: () => ({ storageEngine: undefined }),
}));

vi.mock('../store/hooks/useStudyConfig', () => ({
  useStudyConfig: () => ({ uiConfig: mockUiConfig }),
}));

describe('TrainingFailed', () => {
  beforeEach(() => {
    delete mockUiConfig.trainingFailedRedirectURL;
  });

  test('asks participants to return their submission without a redirect URL', () => {
    const html = renderToStaticMarkup(<TrainingFailed />);
    expect(html).toContain('answer a practice or attention-check question correctly');
    expect(html).toContain('Please return your submission on Prolific.');
    expect(html).not.toContain('redirected');
  });

  test('announces the redirect when a redirect URL is configured', () => {
    mockUiConfig.trainingFailedRedirectURL = 'https://app.prolific.com/submissions/complete?cc=C89OLB9V';
    const html = renderToStaticMarkup(<TrainingFailed />);
    expect(html).toContain('You will be redirected to Prolific in a few seconds');
    expect(html).not.toContain('Please return your submission on Prolific.');
  });
});
