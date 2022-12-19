package org.openmetadata.service.dataInsight;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;
import org.elasticsearch.search.aggregations.Aggregations;
import org.elasticsearch.search.aggregations.bucket.MultiBucketsAggregation;
import org.elasticsearch.search.aggregations.bucket.histogram.Histogram;
import org.elasticsearch.search.aggregations.metrics.Sum;
import org.openmetadata.schema.dataInsight.DataInsightChartResult;
import org.openmetadata.schema.dataInsight.type.TotalEntitiesByTier;

public class TotalEntitiesByTierAggregator extends DataInsightAggregatorInterface<TotalEntitiesByTier> {
  public TotalEntitiesByTierAggregator(
      Aggregations aggregations, DataInsightChartResult.DataInsightChartType dataInsightChartType) {
    super(aggregations, dataInsightChartType);
  }

  @Override
  public DataInsightChartResult process() throws ParseException {
    List data = this.aggregate();
    DataInsightChartResult dataInsightChartResult = new DataInsightChartResult();
    return dataInsightChartResult.withData(data).withChartType(this.dataInsightChartType);
  }

  @Override
  List<TotalEntitiesByTier> aggregate() throws ParseException {
    Histogram timestampBuckets = this.aggregations.get(TIMESTAMP);
    List<TotalEntitiesByTier> data = new ArrayList<>();
    List<Double> entityCount = new ArrayList<>();

    for (Histogram.Bucket timestampBucket : timestampBuckets.getBuckets()) {
      String dateTimeString = timestampBucket.getKeyAsString();
      Long timestamp = this.convertDatTimeStringToTimestamp(dateTimeString);
      MultiBucketsAggregation entityTypeBuckets = timestampBucket.getAggregations().get(ENTITY_TIER);
      for (MultiBucketsAggregation.Bucket entityTierBucket : entityTypeBuckets.getBuckets()) {
        String entityTier = entityTierBucket.getKeyAsString();
        Sum sumEntityCount = entityTierBucket.getAggregations().get(ENTITY_COUNT);
        data.add(
            new TotalEntitiesByTier()
                .withTimestamp(timestamp)
                .withEntityTier(entityTier)
                .withEntityCount(sumEntityCount.getValue()));
        entityCount.add(sumEntityCount.getValue());
      }
    }

    double totalEntities = entityCount.stream().mapToDouble(v -> v).sum();

    for (TotalEntitiesByTier el : data) {
      el.withEntityCountFraction(el.getEntityCount() / totalEntities);
    }

    return data;
  }
}
