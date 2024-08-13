import { defineStore } from 'pinia';
import statisticsApi from '../api/statistics';

export const useStatisticStore = defineStore({
  id: 'statistics-project',
  state: () => ({
    data:[],
    descriptionData: [],
    anovaData: [],
    tukeyResults: [],
    tTestResults: [],
    loading: false
  }),

  actions: {
    async fetchStatistics(inputBatchId, projectId, criterionId) {
      console.log('Fetching statistics');
      this.loading = true;

      const params = {
        input_batch_id: inputBatchId,
        project_id: projectId,
        criterion_id: criterionId
      };

      try {
        // Fetch data for describing
        const dataRes = await statisticsApi.getData(params);
        this.data = dataRes;

        // Assuming describeRes is the object containing description data
        const describeRes = await statisticsApi.describeData(params);
        const descriptionData = [];

        Object.keys(describeRes.description).forEach(stat => {
          const statValues = describeRes.description[stat];
          const dataEntry = {
            stat: stat
          };

          // Loop through each treatment code (CT1, CT2, CT3, CT4) and add their values
          Object.keys(statValues).forEach(code => {
            dataEntry[code] = statValues[code];
          });

          descriptionData.push(dataEntry);
        });

        this.descriptionData = descriptionData;

        // Fetch ANOVA results
        const anovaRes = await statisticsApi.performAnova(params);
        console.log('anovaRes', anovaRes.result)
        this.anovaData = [
          {
            source: 'Residual',
            sum_sq: anovaRes.result.sum_sq.Residual,
            df: anovaRes.result.df.Residual,
            mean_sq: anovaRes.result.sum_sq.Residual/anovaRes.result.df.Residual,
            F: anovaRes.result.F.Residual,
            'PR(>F)': anovaRes.result['PR(>F)'].Residual
          },
          {
            source: 'treatment_code',
            sum_sq: anovaRes.result.sum_sq.treatment_code,
            df: anovaRes.result.df.treatment_code,
            mean_sq: anovaRes.result.sum_sq.treatment_code/anovaRes.result.df.treatment_code,
            F: anovaRes.result.F.treatment_code,
            'PR(>F)': anovaRes.result['PR(>F)'].treatment_code
          },
        ];

        // Fetch Tukey test results
        const tukeyRes = await statisticsApi.performTukeyTest(params);
        this.tukeyResults = tukeyRes.result;

        // Fetch T-test results
        const tTestRes = await statisticsApi.performTTest(params);
        this.tTestResults = tTestRes.result;
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});
