/*
 *  Copyright 2022 Collate
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

import { Card, Col, Row, Statistic } from 'antd';
import { AxiosError } from 'axios';
import { sortBy } from 'lodash';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getListTestCase } from '../../../axiosAPIs/testAPI';
import { API_RES_MAX_SIZE } from '../../../constants/constants';
import {
  INITIAL_COUNT_METRIC_VALUE,
  INITIAL_MATH_METRIC_VALUE,
  INITIAL_PROPORTION_METRIC_VALUE,
  INITIAL_SUM_METRIC_VALUE,
  INITIAL_TEST_RESULT_SUMMARY,
} from '../../../constants/profiler.constant';
import { getTableFQNFromColumnFQN } from '../../../utils/CommonUtils';
import { updateTestResults } from '../../../utils/DataQualityAndProfilerUtils';
import { generateEntityLink } from '../../../utils/TableUtils';
import { showErrorToast } from '../../../utils/ToastUtils';
import Ellipses from '../../common/Ellipses/Ellipses';
import { TableTestsType } from '../../TableProfiler/TableProfiler.interface';
import {
  MetricChartType,
  ProfilerTabProps,
} from '../profilerDashboard.interface';
import ProfilerDetailsCard from './ProfilerDetailsCard';
import ProfilerSummaryCard from './ProfilerSummaryCard';

const ProfilerTab: React.FC<ProfilerTabProps> = ({
  activeColumnDetails,
  profilerData,
  tableProfile,
}) => {
  const { entityTypeFQN } = useParams<Record<string, string>>();
  const [countMetrics, setCountMetrics] = useState<MetricChartType>(
    INITIAL_COUNT_METRIC_VALUE
  );
  const [proportionMetrics, setProportionMetrics] = useState<MetricChartType>(
    INITIAL_PROPORTION_METRIC_VALUE
  );
  const [mathMetrics, setMathMetrics] = useState<MetricChartType>(
    INITIAL_MATH_METRIC_VALUE
  );
  const [sumMetrics, setSumMetrics] = useState<MetricChartType>(
    INITIAL_SUM_METRIC_VALUE
  );
  const [tableTests, setTableTests] = useState<TableTestsType>({
    tests: [],
    results: INITIAL_TEST_RESULT_SUMMARY,
  });

  const tableState = useMemo(
    () => [
      {
        title: 'Row Count',
        value: tableProfile?.rowCount || 0,
      },
      {
        title: 'Column Count',
        value: tableProfile?.columnCount || 0,
      },
      {
        title: 'Table Sample %',
        value: `${tableProfile?.profileSample || 100}%`,
      },
    ],
    [tableProfile]
  );
  const testSummary = useMemo(() => {
    const { results } = tableTests;

    return [
      {
        title: 'Success',
        value: results.success,
      },
      {
        title: 'Aborted',
        value: results.aborted,
      },
      {
        title: 'Failed',
        value: results.failed,
      },
    ];
  }, [tableTests]);

  const createMetricsChartData = () => {
    const updateProfilerData = sortBy(profilerData, 'timestamp');
    const countMetricData: MetricChartType['data'] = [];
    const proportionMetricData: MetricChartType['data'] = [];
    const mathMetricData: MetricChartType['data'] = [];
    const sumMetricData: MetricChartType['data'] = [];
    updateProfilerData.forEach((col) => {
      const x = moment.unix(col.timestamp || 0).format('DD/MMM HH:mm');

      countMetricData.push({
        name: x,
        timestamp: col.timestamp || 0,
        distinctCount: col?.distinctCount || 0,
        nullCount: col?.nullCount || 0,
        uniqueCount: col?.uniqueCount || 0,
        valuesCount: col?.valuesCount || 0,
      });

      sumMetricData.push({
        name: x,
        timestamp: col.timestamp || 0,
        sum: col?.sum || 0,
      });

      mathMetricData.push({
        name: x,
        timestamp: col.timestamp || 0,
        max: (col?.max as number) || 0,
        min: (col?.min as number) || 0,
        mean: col?.mean || 0,
        median: col?.median || 0,
      });

      proportionMetricData.push({
        name: x,
        timestamp: col.timestamp || 0,
        distinctProportion: Math.round((col?.distinctProportion || 0) * 100),
        nullProportion: Math.round((col?.nullProportion || 0) * 100),
        uniqueProportion: Math.round((col?.uniqueProportion || 0) * 100),
      });
    });

    const countMetricInfo = countMetrics.information.map((item) => ({
      ...item,
      latestValue:
        countMetricData[countMetricData.length - 1]?.[item.dataKey] || 0,
    }));
    const proportionMetricInfo = proportionMetrics.information.map((item) => ({
      ...item,
      latestValue: parseFloat(
        `${
          proportionMetricData[proportionMetricData.length - 1]?.[
            item.dataKey
          ] || 0
        }`
      ).toFixed(2),
    }));
    const mathMetricInfo = mathMetrics.information.map((item) => ({
      ...item,
      latestValue:
        mathMetricData[mathMetricData.length - 1]?.[item.dataKey] || 0,
    }));
    const sumMetricInfo = sumMetrics.information.map((item) => ({
      ...item,
      latestValue: sumMetricData[sumMetricData.length - 1]?.[item.dataKey] || 0,
    }));

    setCountMetrics((pre) => ({
      ...pre,
      information: countMetricInfo,
      data: countMetricData,
    }));
    setProportionMetrics((pre) => ({
      ...pre,
      information: proportionMetricInfo,
      data: proportionMetricData,
    }));
    setMathMetrics((pre) => ({
      ...pre,
      information: mathMetricInfo,
      data: mathMetricData,
    }));
    setSumMetrics((pre) => ({
      ...pre,
      information: sumMetricInfo,
      data: sumMetricData,
    }));
  };

  const fetchAllTests = async () => {
    const tableFqn = getTableFQNFromColumnFQN(entityTypeFQN);
    try {
      const { data } = await getListTestCase({
        fields: 'testCaseResult',
        entityLink: generateEntityLink(tableFqn),
        limit: API_RES_MAX_SIZE,
      });
      const tableTests: TableTestsType = {
        tests: [],
        results: { ...INITIAL_TEST_RESULT_SUMMARY },
      };
      data.forEach((test) => {
        updateTestResults(
          tableTests.results,
          test.testCaseResult?.testCaseStatus || ''
        );
      });
      setTableTests(tableTests);
    } catch (error) {
      showErrorToast(error as AxiosError);
    }
  };

  useEffect(() => {
    createMetricsChartData();
  }, [profilerData]);

  useEffect(() => {
    fetchAllTests();
  }, []);

  return (
    <Row gutter={[16, 16]}>
      <Col span={8}>
        <Card className="tw-rounded-md tw-border tw-h-full">
          <Row gutter={16}>
            <Col span={16}>
              <p className="tw-font-medium tw-text-base">Column summary</p>
              <Ellipses className="tw-text-grey-muted" rows={4}>
                {activeColumnDetails.description || 'No Description'}
              </Ellipses>
            </Col>
            <Col span={8}>
              <Statistic
                title="Data type"
                value={activeColumnDetails.dataType || ''}
                valueStyle={{
                  color: '#1890FF',
                  fontSize: '24px',
                  fontWeight: 600,
                }}
              />
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={8}>
        <ProfilerSummaryCard data={tableState} title="Table Metrics Summary" />
      </Col>
      <Col span={8}>
        <ProfilerSummaryCard
          showIndicator
          data={testSummary}
          title="Table Tests Summary"
        />
      </Col>
      <Col span={24}>
        <ProfilerDetailsCard chartCollection={countMetrics} />
      </Col>
      <Col span={24}>
        <ProfilerDetailsCard
          chartCollection={proportionMetrics}
          tickFormatter="%"
        />
      </Col>
      <Col span={24}>
        <ProfilerDetailsCard chartCollection={mathMetrics} />
      </Col>
      <Col span={24}>
        <ProfilerDetailsCard chartCollection={sumMetrics} />
      </Col>
    </Row>
  );
};

export default ProfilerTab;
