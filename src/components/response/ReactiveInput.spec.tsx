import { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { ReactiveInput } from './ReactiveInput';
import { ReactiveResponse } from '../../parser/types';

const baseResponse: ReactiveResponse = {
  id: 'graphVis',
  type: 'reactive',
  prompt: 'Select nodes',
  location: 'belowStimulus',
};

function render(response: ReactiveResponse, value?: string[]): string {
  const wrap = (children: ReactNode) => <MantineProvider>{children}</MantineProvider>;
  return renderToStaticMarkup(wrap(
    <ReactiveInput response={response} answer={{ value }} index={1} enumerateQuestions={false} />,
  ));
}

describe('ReactiveInput', () => {
  test('lists the values sent from the stimulus by default', () => {
    const html = render(baseResponse, ['Ava', 'Ellie']);
    expect(html).toContain('Ava');
    expect(html).toContain('Ellie');
  });

  test('lists the values when showList is true', () => {
    expect(render({ ...baseResponse, showList: true }, ['Ava'])).toContain('Ava');
  });

  test('does not list the values when showList is false', () => {
    const html = render({ ...baseResponse, showList: false }, ['Ava', 'Ellie']);
    expect(html).not.toContain('Ava');
    expect(html).not.toContain('Ellie');
    expect(html).toContain('Select nodes');
  });
});
