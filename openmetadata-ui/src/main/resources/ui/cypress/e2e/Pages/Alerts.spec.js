/*
 *  Copyright 2021 Collate
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
    interceptURL,
    toastNotification,
    uuid,
    verifyResponseStatusCode
} from '../../common/common';

import { DELETE_TERM } from '../../constants/constants';

const alertForAllAssets = `Alert-ct-test-${uuid()}`;
const description = 'This is alert description';

const TEST_CASE = {
  testCaseAlert: `TestCaseAlert-ct-test-${uuid()}`,
  testCaseDescription: 'This is test case alert description',
  dataAsset: 'Test Case',
  filters: 'Test Results === Failed',
};

const DESTINATION = {
  webhook: {
    name: `webhookAlert-ct-test-${uuid()}`,
    locator: 'Webhook',
    description: 'This is webhook description',
    url: 'http://localhost:8585',
  },
  slack: {
    name: `slackAlert-ct-test-${uuid()}`,
    locator: 'Slack',
    description: 'This is slack description',
    url: 'http://localhost:8585',
  },
  msteams: {
    name: `msteamsAlert-ct-test-${uuid()}`,
    locator: 'MS Teams',
    description: 'This is ms teams description',
    url: 'http://localhost:8585',
  },
};

describe('Alerts page should work properly', () => {
  beforeEach(() => {
    cy.login();
    cy.get('[data-testid="appbar-item-settings"]')
      .should('exist')
      .and('be.visible')
      .click();
    interceptURL('GET', '/api/v1/alerts', 'alertsPage');
    cy.get('[data-testid="global-setting-left-panel"]')
      .contains('Alerts')
      .scrollIntoView()
      .should('be.visible')
      .and('exist')
      .click();
    verifyResponseStatusCode('@alertsPage', 200);
  });

  it('Create new alert for all data assets', () => {
    interceptURL('POST', '/api/v1/alerts', 'createAlert');
    //Click on create alert button
    cy.get('button').contains('Create alert').should('be.visible').click();
    //Enter alert name
    cy.get('#name').should('be.visible').type(alertForAllAssets);
    //Enter description
    cy.get('#description').should('be.visible').type(description);
    //Click on all data assets
    cy.get('[title="All Data Assets"]').should('be.visible').click();
    cy.get('[title="All Data Assets"]').eq(1).click();
    //Select filters
    cy.get('button').contains('Add Filters').should('exist').click();
    cy.get('#filteringRules_0_name').invoke('show').click();
    //Select owner
    cy.get('[title="Owner"]').should('be.visible').click();
    cy.get('.ant-select-selection-overflow')
      .should('be.visible')
      .click()
      .type('Engineering');
    cy.get('[title="Engineering"]').should('be.visible').click();
    cy.get('#description').should('be.visible').click();
    //Select include/exclude
    cy.get('[title="Include"]').should('be.visible').click();
    cy.get('[title="Include"]').eq(1).click();

    //Select Destination
    cy.get('button').contains('Add Destination').should('exist').click();
    cy.get('.ant-select-selection-placeholder')
      .contains('Select Source')
      .click({ force: true });
    cy.wait(1000);
    cy.get('.ant-select-item-option-content').contains('Email').click();
    cy.wait(500);
    //Enter email
    cy.get(
      '.ant-form-item-control-input-content > .ant-select > .ant-select-selector > .ant-select-selection-overflow'
    )
      .eq(1)
      .click()
      .type('testuser@openmetadata.org');
    //Click save
    cy.get('[type="submit"]').contains('Save').click();
    verifyResponseStatusCode('@createAlert', 201);
    toastNotification('Alerts created successfully.');
    cy.get('table').should('contain', alertForAllAssets);
  });

  it('Edit description for created Alert', () => {
    const updatedDescription = 'This is updated alert description';
    cy.get('table').should('contain', alertForAllAssets).click();
    cy.get(`[data-testid="alert-edit-${alertForAllAssets}"]`)
      .should('be.visible')
      .click();
    cy.get('#description')
      .should('be.visible')
      .clear()
      .focus()
      .type(updatedDescription);
    //Click save
    cy.get('[type="submit"]').contains('Save').click();
    cy.get('.ant-table-cell').should('contain', updatedDescription);
  });

  it('Delete created alert', () => {
    cy.get('table').should('contain', alertForAllAssets).click();
    cy.get(`[data-testid="alert-delete-${alertForAllAssets}"]`)
      .should('be.visible')
      .click();
    cy.get('.ant-modal-header')
      .should('be.visible')
      .should('contain', `Delete ${alertForAllAssets}`);
    cy.get('[data-testid="confirmation-text-input"]')
      .should('be.visible')
      .type(DELETE_TERM);
    interceptURL('DELETE', 'api/v1/alerts/*', 'deleteAlert');
    cy.get('[data-testid="confirm-button"]')
      .should('be.visible')
      .should('not.disabled')
      .click();
    verifyResponseStatusCode('@deleteAlert', 200);

    toastNotification('Alert deleted successfully!');
    cy.get('table').should('not.contain', alertForAllAssets);
  });

  it('Create new alert for all data assets and multiple filters', () => {
    interceptURL('GET', '/api/v1/alerts/*', 'createAlert');
    //Click on create alert button
    cy.get('button').contains('Create alert').should('be.visible').click();
    verifyResponseStatusCode('@createAlert', 200);
    //Enter alert name
    cy.get('#name').should('be.visible').type(alertForAllAssets);
    //Enter description
    cy.get('#description').should('be.visible').type(description);
    //Click on all data assets
    cy.get('[title="All Data Assets"]').should('be.visible').click();
    cy.get('[title="All Data Assets"]').eq(1).click();
    //Select filters
    cy.get('button').contains('Add Filters').should('exist').click();
    cy.get('#filteringRules_0_name').invoke('show').click();
    //Select first owner
    cy.get('[title="Owner"]').should('be.visible').click();
    cy.get('.ant-select-selection-overflow')
      .should('be.visible')
      .click()
      .type('Engineering');
    cy.get('[title="Engineering"]').should('be.visible').click();
    cy.get('#name').should('be.visible').click();

    //Select second owner
    cy.get('.ant-select-selection-overflow')
      .should('be.visible')
      .click()
      .type('Applications');
    cy.get('[title="Applications"]').should('be.visible').click();
    cy.get('#name').should('be.visible').click();

    //Select include/exclude
    cy.get('[title="Include"]').should('be.visible').click();
    cy.get('[title="Include"]').eq(1).click();

    //Select Destination
    cy.get('button').contains('Add Destination').should('exist').click();
    cy.get('.ant-select-selection-placeholder')
      .contains('Select Source')
      .click({ force: true });
    cy.wait(1000);
    cy.get('.ant-select-item-option-content').contains('Email').click();
    cy.wait(500);
    //Enter email
    cy.get(
      '.ant-form-item-control-input-content > .ant-select > .ant-select-selector > .ant-select-selection-overflow'
    )
      .eq(1)
      .click()
      .type('testuser@openmetadata.org');
    //Click save
    cy.get('[type="submit"]').contains('Save').click();
    toastNotification('Alerts created successfully.');
    cy.get('table').should('contain', ALERTS.name);
  });

  it('Create new alert for Test case data asset', () => {
    interceptURL('GET', '/api/v1/alerts/*', 'createAlert');
    //Click on create alert button
    cy.get('button').contains('Create alert').should('be.visible').click();
    verifyResponseStatusCode('@createAlert', 200);
    //Enter alert name
    cy.get('#name').should('be.visible').type(TEST_CASE.testCaseAlert);
    //Enter description
    cy.get('#description')
      .should('be.visible')
      .type(TEST_CASE.testCaseDescription);
    //Click on specific data assets
    cy.get('[title="All Data Assets"]').should('be.visible').click();
    cy.get('[title="Specific Data Assets"]').click();
    cy.get('.ant-select-selection-overflow').should('exist');
    //Select Test case data asset
    cy.get('.ant-select-selection-overflow')
      .should('be.visible')
      .click()
      .type('TestCase');

    cy.get('.ant-select-dropdown')
      .contains('Test Case')
      .scrollIntoView()
      .should('be.visible')
      .click();

    //Select filters
    cy.get('button').contains('Add Filters').should('exist').click();
    cy.get('#filteringRules_0_name').invoke('show').click();
    //Select Test results condition

    cy.get('[title="Test Results"]').should('be.visible').click();
    cy.get('#name').should('be.visible').click();
    //Select result
    cy.get('.ant-select-selection-overflow').eq(1).should('be.visible').click();
    cy.get('[title="Failed"]').should('be.visible').click();
    cy.get('#name').should('be.visible').click();
    //Select include/exclude
    cy.get('[title="Include"]').should('be.visible').click();
    cy.get('[title="Include"]').eq(1).click();

    //Select Destination
    cy.get('button').contains('Add Destination').should('exist').click();
    cy.get('.ant-select-selection-placeholder')
      .contains('Select Source')
      .click({ force: true });
    cy.wait(1000);
    cy.get('.ant-select-item-option-content').contains('Email').click();
    cy.wait(500);
    //Enter email
    cy.get('.ant-select-selector > .ant-select-selection-overflow')
      .eq(2)
      .click()
      .type('testuser@openmetadata.org');
    //Click save
    cy.get('[type="submit"]').contains('Save').click();
    toastNotification('Alerts created successfully.');
    cy.get('table').should('contain', TEST_CASE.testCaseAlert);
    cy.get('.ant-table-cell')
      .should('be.visible')
      .contains(TEST_CASE.testCaseAlert)
      .click();
    //Check data asset
    cy.get(
      '.ant-row-middle > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(3)'
    ).should('contain', TEST_CASE.dataAsset);
    cy.get('div.ant-typography').should('contain', TEST_CASE.filters);
  });

  Object.values(DESTINATION).forEach((destination) => {
    it.only(`Create alert for ${destination.locator}`, () => {
      interceptURL('POST', '/api/v1/alerts', 'createAlert');
      //Click on create alert button
      cy.get('button').contains('Create alert').should('be.visible').click();
      //Enter alert name
      cy.get('#name').should('be.visible').type(destination.name);
      //Enter description
      cy.get('#description').should('be.visible').type(destination.description);
      //Click on all data assets
      cy.get('[title="All Data Assets"]').should('be.visible').click();
      cy.get('[title="All Data Assets"]').eq(1).click();
      //Select filters
      cy.get('button').contains('Add Filters').should('exist').click();
      cy.get('#filteringRules_0_name').invoke('show').click();
      //Select owner
      cy.get('[title="Owner"]').should('be.visible').click();
      cy.get('.ant-select-selection-overflow')
        .should('be.visible')
        .click()
        .type('Engineering');
      cy.get('[title="Engineering"]').should('be.visible').click();
      cy.get('#description').should('be.visible').click();
      //Select include/exclude
      cy.get('[title="Include"]').should('be.visible').click();
      cy.get('[title="Include"]').eq(1).click();

      //Select Destination
      cy.get('button').contains('Add Destination').should('exist').click();
      cy.get('.ant-select-selection-placeholder')
        .contains('Select Source')
        .click({ force: true });
      cy.wait(1000);
      cy.get('.ant-select-item-option-content')
        .contains(destination.locator)
        .click();
      cy.wait(500);
      //Enter url
      cy.get('#alertActions_0_alertActionConfig_endpoint')
        .click()
        .type(destination.url);
      //Click save
      cy.get('[type="submit"]').contains('Save').click();
      verifyResponseStatusCode('@createAlert', 201);
      toastNotification('Alerts created successfully.');
      //Verify created alert
      cy.get('table').should('contain', destination.name);
      cy.get('.ant-table-cell')
        .should('be.visible')
        .contains(destination.name)
        .click();

      cy.get('.ant-row').should('contain', destination.locator);
    });
  });
});
