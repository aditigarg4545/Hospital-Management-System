// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { AppShell, ErrorBoundary, Loading, useMedplum, useMedplumProfile } from '@medplum/react';
import AppLogo from '../../../packages/assets/AppLogo.avif';
import { IconMessage2Down, IconMessage2Plus, IconSquareRoundedArrowRight } from '@tabler/icons-react';
import type { JSX } from 'react';
import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import classes from './App.module.css';
import DemoInstructionsPage from './components/DemoInstructionsPage';
import LandingPage from './components/LandingPage';
import Publisher from './components/Publisher';
import SignInPage from './components/SignInPage';
import Subscriber from './components/Subscriber';

export function App(): JSX.Element | null {
  const medplum = useMedplum();
  const profile = useMedplumProfile();

  if (medplum.isLoading()) {
    return null;
  }

  return (
    <AppShell
      logo={<img src={AppLogo} alt="Logo" style={{ height: 24 }} />}
      menus={
        profile
          ? [
              {
                title: 'Info',
                links: [{ icon: <IconSquareRoundedArrowRight />, label: 'Running the demo', href: '/' }],
              },
              {
                title: 'Apps',
                links: [
                  { icon: <IconMessage2Plus />, label: 'Publisher', href: '/publisher' },
                  { icon: <IconMessage2Down />, label: 'Subscriber', href: '/subscriber' },
                ],
              },
            ]
          : []
      }
      headerSearchDisabled={true}
      resourceTypeSearchDisabled={true}
    >
      <div className={classes.root}>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={!profile ? <LandingPage /> : <DemoInstructionsPage />} />
              <Route path="/signin" element={!profile ? <SignInPage /> : <Navigate to="/" />} />
              <Route path="/publisher" element={<Publisher />} />
              <Route path="/subscriber" element={<Subscriber />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </AppShell>
  );
}

export default App;
