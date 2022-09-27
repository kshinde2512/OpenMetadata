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
package org.openmetadata.service.secrets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.openmetadata.schema.EntityInterface;
import org.openmetadata.schema.api.services.CreateDatabaseService;
import org.openmetadata.schema.entity.services.ServiceType;
import org.openmetadata.schema.entity.services.ingestionPipelines.IngestionPipeline;
import org.openmetadata.schema.entity.services.ingestionPipelines.PipelineType;
import org.openmetadata.schema.metadataIngestion.DatabaseServiceMetadataPipeline;
import org.openmetadata.schema.metadataIngestion.SourceConfig;
import org.openmetadata.schema.services.connections.database.MysqlConnection;
import org.openmetadata.schema.services.connections.metadata.SecretsManagerProvider;
import org.openmetadata.schema.type.EntityReference;

@ExtendWith(MockitoExtension.class)
public abstract class ExternalSecretsManagerTest {

  static final boolean ENCRYPT = true;
  static final String AUTH_PROVIDER_SECRET_ID_PREFIX = "auth-provider";
  static final String TEST_CONNECTION_SECRET_ID_PREFIX = "test-connection-temp";
  static final boolean DECRYPT = false;
  static final String EXPECTED_CONNECTION_JSON =
      "{\"type\":\"Mysql\",\"scheme\":\"mysql+pymysql\",\"password\":\"openmetadata-test\",\"supportsMetadataExtraction\":true,\"supportsProfiler\":true,\"supportsQueryComment\":true}";
  static final String EXPECTED_SECRET_ID = "/openmetadata/service/database/mysql/test";

  AWSBasedSecretsManager secretsManager;

  @BeforeEach
  void setUp() {
    Map<String, String> parameters = new HashMap<>();
    parameters.put("region", "eu-west-1");
    parameters.put("accessKeyId", "123456");
    parameters.put("secretAccessKey", "654321");
    SecretsManagerConfiguration config = new SecretsManagerConfiguration();
    config.setParameters(parameters);
    setUpSpecific(config);
  }

  @Test
  void testIsNotLocalSecretsManager() {
    assertFalse(secretsManager.isLocal());
  }

  @Test
  void testDecryptDatabaseServiceConnectionConfig() {
    mockClientGetValue(EXPECTED_CONNECTION_JSON);
    testEncryptDecryptServiceConnection(DECRYPT);
  }

  @Test
  void testReturnsExpectedSecretManagerProvider() {
    assertEquals(expectedSecretManagerProvider(), secretsManager.getSecretsManagerProvider());
  }

  @ParameterizedTest
  @MethodSource(
      "org.openmetadata.service.resources.services.ingestionpipelines.IngestionPipelineResourceUnitTestParams#params")
  public void testEncryptAndDecryptDbtConfigSource(
      Object config,
      EntityReference service,
      Class<? extends EntityInterface> serviceClass,
      PipelineType pipelineType,
      boolean mustBeEncrypted) {

    SourceConfig sourceConfigMock = mock(SourceConfig.class);
    IngestionPipeline mockedIngestionPipeline = mock(IngestionPipeline.class);

    when(mockedIngestionPipeline.getService()).thenReturn(service);
    lenient().when(mockedIngestionPipeline.getPipelineType()).thenReturn(pipelineType);

    if (mustBeEncrypted) {
      when(mockedIngestionPipeline.getSourceConfig()).thenReturn(sourceConfigMock);
      when(sourceConfigMock.getConfig()).thenReturn(config);
      mockClientGetValue("{}");
    }

    secretsManager.encryptOrDecryptDbtConfigSource(mockedIngestionPipeline, true);

    secretsManager.encryptOrDecryptDbtConfigSource(mockedIngestionPipeline, false);

    if (!mustBeEncrypted) {
      verify(mockedIngestionPipeline, never()).setSourceConfig(any());
      verify(sourceConfigMock, never()).setConfig(any());
    } else {
      ArgumentCaptor<Object> configCaptor = ArgumentCaptor.forClass(Object.class);
      verify(mockedIngestionPipeline, times(4)).getSourceConfig();
      verify(sourceConfigMock, times(2)).setConfig(configCaptor.capture());
      verifySecretIdGetCalls("/openmetadata/database-metadata-pipeline/database-service", 2);
      assertNull(((DatabaseServiceMetadataPipeline) configCaptor.getAllValues().get(0)).getDbtConfigSource());
      assertEquals(configCaptor.getAllValues().get(1), config);
      assertNotSame(configCaptor.getAllValues().get(1), config);
    }
  }

  abstract void setUpSpecific(SecretsManagerConfiguration config);

  abstract void mockClientGetValue(String value);

  abstract void verifySecretIdGetCalls(String expectedSecretId, int times);

  abstract void verifyClientCalls(Object expectedAuthProviderConfig, String expectedSecretId)
      throws JsonProcessingException;

  void testEncryptDecryptServiceConnection(boolean decrypt) {
    MysqlConnection mysqlConnection = new MysqlConnection();
    mysqlConnection.setPassword("openmetadata-test");
    CreateDatabaseService.DatabaseServiceType databaseServiceType = CreateDatabaseService.DatabaseServiceType.Mysql;
    String connectionName = "test";

    Object actualConfig =
        secretsManager.encryptOrDecryptServiceConnectionConfig(
            mysqlConnection, databaseServiceType.value(), connectionName, ServiceType.DATABASE, decrypt);

    if (decrypt) {
      assertNull(actualConfig);
    } else {
      assertEquals(mysqlConnection, actualConfig);
      assertNotSame(mysqlConnection, actualConfig);
    }
  }

  abstract SecretsManagerProvider expectedSecretManagerProvider();
}
