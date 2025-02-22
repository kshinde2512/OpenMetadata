/*
 *  Copyright 2024 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
// import { ROUTES } from '../../../constants/constants';
import { ROUTES } from '../../../constants/constants';
import { mockApplicationData } from '../../../mocks/rests/applicationAPI.mock';
import MarketPlaceAppDetails from './MarketPlaceAppDetails.component';

const mockPush = jest.fn();
const mockShowErrorToast = jest.fn();
const mockGetApplicationByName = jest.fn().mockReturnValue(mockApplicationData);
const mockGetMarketPlaceApplicationByFqn = jest.fn().mockReturnValue({
  description: 'marketplace description',
  fullyQualifiedName: 'marketplace fqn',
  supportEmail: 'support@email.com',
  developerUrl: 'https://xyz.com',
  privacyPolicyUrl: 'https://xyz.com',
  appScreenshots: ['screenshot1', 'screenshot2'],
});

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn().mockImplementation(() => ({
    push: mockPush,
  })),
}));

jest.mock(
  '../../../components/common/RichTextEditor/RichTextEditorPreviewer',
  () => jest.fn().mockReturnValue(<>RichTextEditorPreviewer</>)
);

jest.mock('../../../components/Loader/Loader', () =>
  jest.fn().mockReturnValue(<div>Loader</div>)
);

jest.mock('../../../components/PageLayoutV1/PageLayoutV1', () =>
  jest.fn().mockImplementation(({ leftPanel, children }) => (
    <div>
      {leftPanel}
      {children}
    </div>
  ))
);

jest.mock('../../../hooks/useFqn', () => ({
  useFqn: jest.fn().mockReturnValue({ fqn: 'mockFQN' }),
}));

jest.mock('../../../rest/applicationAPI', () => ({
  getApplicationByName: jest
    .fn()
    .mockImplementation(() => mockGetApplicationByName()),
}));

jest.mock('../../../rest/applicationMarketPlaceAPI', () => ({
  getMarketPlaceApplicationByFqn: jest
    .fn()
    .mockImplementation((...args) =>
      mockGetMarketPlaceApplicationByFqn(...args)
    ),
}));

jest.mock('../../../utils/EntityUtils', () => ({
  getEntityName: jest.fn(),
}));

jest.mock('../../../utils/RouterUtils', () => ({
  getAppInstallPath: jest.fn().mockReturnValue('app install path'),
}));

jest.mock('../../../utils/ToastUtils', () => ({
  showErrorToast: jest
    .fn()
    .mockImplementation((...args) => mockShowErrorToast(...args)),
}));

jest.mock('../AppLogo/AppLogo.component', () =>
  jest.fn().mockImplementation(() => <>AppLogo</>)
);

describe('MarketPlaceAppDetails component', () => {
  it('should render all necessary elements if app details fetch successfully', async () => {
    render(<MarketPlaceAppDetails />);

    await waitForElementToBeRemoved(() => screen.getByText('Loader'));

    expect(mockGetMarketPlaceApplicationByFqn).toHaveBeenCalledWith('mockFQN', {
      fields: expect.anything(),
    });
    expect(mockGetApplicationByName).toHaveBeenCalled();

    expect(screen.getByText('AppLogo')).toBeInTheDocument();

    expect(
      screen.getByText('message.marketplace-verify-msg')
    ).toBeInTheDocument();
    expect(screen.getByText('label.get-app-support')).toBeInTheDocument();
    expect(
      screen.getByText('label.visit-developer-website')
    ).toBeInTheDocument();
    expect(screen.getByText('label.privacy-policy')).toBeInTheDocument();
    expect(screen.getByText('label.get-app-support')).toBeInTheDocument();

    // actions check
    userEvent.click(
      screen.getByRole('button', { name: 'left label.browse-app-plural' })
    );

    expect(mockPush).toHaveBeenCalledWith(ROUTES.MARKETPLACE);
  });

  it('should show toast error, if failed to fetch app details', async () => {
    const MARKETPLACE_APP_DETAILS_ERROR = 'marketplace app data fetch failed.';
    const APP_DETAILS_ERROR = 'app data fetch failed.';
    mockGetMarketPlaceApplicationByFqn.mockRejectedValueOnce(
      MARKETPLACE_APP_DETAILS_ERROR
    );
    mockGetApplicationByName.mockRejectedValueOnce(APP_DETAILS_ERROR);

    render(<MarketPlaceAppDetails />);

    await waitForElementToBeRemoved(() => screen.getByText('Loader'));

    expect(mockGetMarketPlaceApplicationByFqn).toHaveBeenCalledWith('mockFQN', {
      fields: expect.anything(),
    });
    expect(mockShowErrorToast).toHaveBeenCalledWith(
      MARKETPLACE_APP_DETAILS_ERROR
    );

    // app install action check
    // making install button enable by rejecting promise in getApplicationByName
    userEvent.click(screen.getByRole('button', { name: 'label.install' }));

    expect(mockPush).toHaveBeenCalledWith('app install path');
  });
});
