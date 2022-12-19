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
    addOwner,
    addTag,
    addTier, checkAddGroupWithOperator, checkmustPaths,
    checkmust_notPaths,
    CONDITIONS_MUST,
    CONDITIONS_MUST_NOT,
    FIELDS,
    OPERATOR
} from '../../common/advancedSearch';

describe('Advance search should work properly', () => {
  beforeEach(() => {
    cy.login();
    cy.get('[data-testid="appbar-item-explore"]').and('be.visible').click();
  });

  it('Pre-requisite for advance search', () => {
    addOwner(FIELDS.Owner.searchCriteriaFirstGroup);
    addTier(FIELDS.Tiers.searchCriteriaFirstGroup);
    addTag(FIELDS.Tags.searchCriteriaFirstGroup);
  });

  Object.values(FIELDS).forEach((field) => {
    it.only(`Verify advance search results for ${field.name} field and all condition`, () => {
      Object.values(CONDITIONS_MUST).forEach((condition) => {
        checkmustPaths(
          condition.name,
          field.testid,
          field.searchCriteriaFirstGroup,
          0,
          field.responseValueFirstGroup
        );
      });
      cy.wait(1000);
      Object.values(CONDITIONS_MUST_NOT).forEach((condition) => {
        checkmust_notPaths(
          condition.name,
          field.testid,
          field.searchCriteriaFirstGroup,
          0,
          field.responseValueFirstGroup
        );
      });
    });
  });

  Object.values(FIELDS).forEach((field) => {
    Object.values(OPERATOR).forEach((operator) => {
      it(`Verify Add group functionality for ${field.name} field with ${operator.name} operator & condition ${CONDITIONS_MUST.equalTo.name} and ${CONDITIONS_MUST_NOT.notEqualTo.name} `, () => {
        checkAddGroupWithOperator(
          CONDITIONS_MUST.equalTo.name,
          CONDITIONS_MUST_NOT.notEqualTo.name,
          field.testid,
          field.searchCriteriaFirstGroup,
          field.searchCriteriaSecondGroup,
          0,
          1,
          operator.index,
          CONDITIONS_MUST.equalTo.filter,
          CONDITIONS_MUST_NOT.notEqualTo.filter,
          field.responseValueFirstGroup,
          field.responseValueSecondGroup
        );
      });

      it(`Verify Add group functionality for ${field.name} field with ${operator.name} operator & condition ${CONDITIONS_MUST.anyIn.name} and ${CONDITIONS_MUST_NOT.notIn.name} `, () => {
        checkAddGroupWithOperator(
          CONDITIONS_MUST.anyIn.name,
          CONDITIONS_MUST_NOT.notIn.name,
          field.testid,
          field.searchCriteriaFirstGroup,
          field.searchCriteriaSecondGroup,
          0,
          1,
          operator.index,
          CONDITIONS_MUST.anyIn.filter,
          CONDITIONS_MUST_NOT.notIn.filter,
          field.responseValueFirstGroup,
          field.responseValueSecondGroup
        );
      });
    });
  });
});
