// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Anchor, Text } from '@mantine/core';
import { RegisterForm, SignInForm } from '@medplum/react';
import { IconHospital } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useLocation, useNavigate } from 'react-router';
import './SignInPage.css';

export function SignInPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header Section */}
          <div className="auth-header">
            <div className="auth-header-icon">
              <IconHospital size={32} stroke={2} />
            </div>
            <h1 className="auth-header-title">Synthlane Hospital</h1>
            <p className="auth-header-subtitle">Hospital Management System</p>
          </div>

          {/* Form Section */}
          <div className="auth-body">
            {isRegister ? (
              <>
                <RegisterForm
                  type="project"
                  projectId={import.meta.env.VITE_MEDPLUM_PROJECT_ID || 'new'}
                  clientId={import.meta.env.VITE_MEDPLUM_CLIENT_ID}
                  googleClientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                  onSuccess={() => navigate('/')}
                >
                  <h2
                    style={{
                      textAlign: 'center',
                      marginBottom: '16px',
                      marginTop: 0,
                      fontSize: '20px',
                      fontWeight: 600,
                    }}
                  >
                    Create New Account
                  </h2>
                </RegisterForm>
                <Text ta="center" mt="md" size="sm">
                  Already have an account?{' '}
                  <Anchor component="button" onClick={() => navigate('/signin')}>
                    Sign In
                  </Anchor>
                </Text>
              </>
            ) : (
              <SignInForm
                onSuccess={() => navigate('/')}
                onRegister={() => navigate('/register')}
                googleClientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              >
                <h2
                  style={{ textAlign: 'center', marginBottom: '16px', marginTop: 0, fontSize: '20px', fontWeight: 600 }}
                >
                  Sign In
                </h2>
              </SignInForm>
            )}
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <p className="auth-footer-text">© 2025 Synthlane Hospital. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
