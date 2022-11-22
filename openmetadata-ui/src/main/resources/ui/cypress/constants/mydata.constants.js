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

import { BASE_URL } from './constants';

export const LEFT_PANEL_DETAILS = {
  tables: {
    testid: '[data-testid="tables"]',
    url: `${BASE_URL}/explore/tables`,
  },
  topics: {
    testid: '[data-testid="topics"]',
    url: `${BASE_URL}/explore/topics`,
  },
  dashboard: {
    testid: '[data-testid="dashboards"]',
    url: `${BASE_URL}/explore/dashboards`,
  },
  pipelines: {
    testid: '[data-testid="pipelines"]',
    url: `${BASE_URL}/explore/pipelines`,
  },
  mlmodels: {
    testid: '[data-testid="mlmodels"]',
    url: `${BASE_URL}/explore/mlmodels`,
  },
  testSuites: {
    testid: '[data-testid="test-suite"]',
    url: `${BASE_URL}/test-suites`,
  },
  services: {
    testid: '[data-testid="service"]',
    url: `${BASE_URL}/settings/services/databases`,
  },
  users: {
    testid: '[data-testid="user"]',
    url: `${BASE_URL}/settings/members/users`,
  },
  teams: {
    testid: '[data-testid="terms"]',
    url: `${BASE_URL}/settings/members/teams`,
  },
};

export const NAVBAR_DETAILS = {
  explore: {
    testid: '[data-testid="appbar-item-explore"]',
    url: `${BASE_URL}/explore/tables/?page=1`,
  },
  quality: {
    testid: '[data-testid="appbar-item-data-quality"]',
    url: `${BASE_URL}/test-suites`,
  },
  insights: {
    testid: '[data-testid="appbar-item-data-insight"]',
    url: `${BASE_URL}/data-insights`,
  },
  settings: {
    testid: '[data-testid="appbar-item-settings"]',
    url: `${BASE_URL}/settings/members/teams/Organization`,
  },
};

export const GOVERN_DETAILS = {
  glossary: {
    testid: '[data-testid="appbar-item-glossary"]',
    url: `${BASE_URL}/glossary`,
  },
  tags: {
    testid: '[data-testid="appbar-item-tags"]',
    url: `${BASE_URL}/tags`,
  },
};
