import { Text } from '@mantine/core';
import { useEffect } from 'react';
import { useStorageEngine } from '../storage/storageEngineHooks';
import { useStudyConfig } from '../store/hooks/useStudyConfig';
import { scheduleTrainingFailedRedirect } from './TrainingFailed.utils';

export function TrainingFailed() {
  const { storageEngine } = useStorageEngine();
  const { trainingFailedRedirectURL, studyEndAutoRedirectDelay } = useStudyConfig().uiConfig;

  useEffect(() => {
    const rejection = storageEngine
      ? storageEngine.rejectCurrentParticipant('Failed training')
        .catch(() => {
          console.error('Failed to reject participant who failed training');
        })
      : Promise.resolve();

    if (!trainingFailedRedirectURL) {
      return undefined;
    }

    return scheduleTrainingFailedRedirect(rejection, trainingFailedRedirectURL, studyEndAutoRedirectDelay);
  }, [storageEngine, trainingFailedRedirectURL, studyEndAutoRedirectDelay]);

  return (
    <Text>
      Thank you for participating. Unfortunately you didn&apos;t answer a practice or attention-check question correctly, which means you are not eligible to continue the study.
      {' '}
      {trainingFailedRedirectURL
        ? 'You will be redirected to Prolific in a few seconds, where you can return your submission.'
        : 'Please return your submission on Prolific.'}
    </Text>
  );
}
