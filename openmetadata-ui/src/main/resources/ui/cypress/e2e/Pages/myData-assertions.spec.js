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

import { BASE_URL } from '../../constants/constants';
import { GOVERN_DETAILS, LEFT_PANEL_DETAILS, NAVBAR_DETAILS } from '../../constants/mydata.constants';

const validateURL = (url) => {
  cy.url().should('contain', url);
};

describe('Mydata page assertions should work properly', () => {
  beforeEach(() => {
    cy.login();
  });

  it('Check redirection links for navbar', () => {
    Object.values(NAVBAR_DETAILS).map((navbar) => {
      cy.get(navbar.testid).should('be.visible').click();
      validateURL(navbar.url);
      cy.clickOnLogo();
      validateURL(`${BASE_URL}/my-data`);
    });
  });

  it('Check redirection for Governance', () => {
   Object.values(GOVERN_DETAILS).map((governance) => {
    cy.get('[data-testid="governance"]').should('be.visible').click();
    cy.wait(500);
    cy.get(governance.testid).should('be.visible').click();
    validateURL(governance.url);
    cy.clickOnLogo();
    validateURL(`${BASE_URL}/my-data`);
  });
 });

  it(`Check redirection links for left panel.`, () => {
    Object.values(LEFT_PANEL_DETAILS).map((leftpanel) => {
      cy.get(leftpanel.testid).should('be.visible').click();
      validateURL(leftpanel.url);
      cy.clickOnLogo();
      validateURL(`${BASE_URL}/my-data`);
    });
  });
});
