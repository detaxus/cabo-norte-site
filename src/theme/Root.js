import React, {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import Root from '@theme-original/Root';

import '@site/src/css/section-cards.css';
import '@site/src/css/citizenship-form.css';

export default function RootWrapper({children}) {
  const location = useLocation();

  useEffect(() => {
    const closeDetails = () => {
      document
        .querySelectorAll('.cn-detail')
        .forEach((detail) => {
          detail.open = false;
        });
    };

    const frame =
      requestAnimationFrame(
        closeDetails
      );

    return () =>
      cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <Root>
      {children}
    </Root>
  );
}
