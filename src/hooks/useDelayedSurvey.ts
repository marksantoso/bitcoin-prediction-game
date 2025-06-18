import { useEffect } from 'react';

const SURVEY_CLASS = 'PostHogSurvey-01977e06-840e-0000-43b6-7dd02188406d';
const SURVEY_DELAY_MS = 120000;

export function useDelayedSurvey() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const showSurveyAfterDelay = (element: HTMLElement) => {
      element.style.display = 'none';
      timeoutId = setTimeout(() => element.style.display = '', SURVEY_DELAY_MS);
    };

    // Handle existing survey if present
    const existingSurvey = document.querySelector(`.${SURVEY_CLASS}`) as HTMLElement;
    if (existingSurvey) showSurveyAfterDelay(existingSurvey);

    // Watch for survey element being added
    const observer = new MutationObserver(mutations => 
      mutations.forEach(mutation => 
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement && node.classList.contains(SURVEY_CLASS)) {
            showSurveyAfterDelay(node);
            observer.disconnect();
          }
        })
      )
    );

    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup observer and timeout on unmount
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array since we don't have any dependencies
} 