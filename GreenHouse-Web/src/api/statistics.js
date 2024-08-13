import axios from 'axios';


export default {

async getData(params) {
  try {
    const { input_batch_id, project_id, criterion_id } = params;
    const token = localStorage.getItem('token');
    // Fetch data from API_BASE_URL
    const res = await axios.get(`http://localhost:8083/api/projectDetail/getInputBatch/?input_batch_id=${input_batch_id}&project_id=${project_id}&criterion_id=${criterion_id}`, {
      headers: {
        'Authorization': `${token}`
      }
    });
    if (res.status == 200) {
      console.log("Success");
      console.log(res.data);
      console.log(input_batch_id, project_id, criterion_id);
      if (res.data.length === 0) {
        console.log("API trả về mảng rỗng.");
        // Thực hiện các hành động khác tùy thuộc vào logic ứng dụng của bạn
      } else {
        console.log("API trả về mảng khác rỗng.");
      }

      return res.data;
    }

    return false;
  }
  catch {
    return false;
  }
},

// Describe data
async describeData(params) {
  try {
    const { input_batch_id, project_id, criterion_id } = params;
    const token = localStorage.getItem('token');
    
    // Fetch data from API_BASE_URL
    const response = await axios.get(`http://localhost:8083/api/projectDetail/getInputBatch/?input_batch_id=${input_batch_id}&project_id=${project_id}&criterion_id=${criterion_id}`, {
      headers: {
        'Authorization': `${token}`
      }
    });
    if (response.status == 200) {
      const data = response.data;
      // Send the fetched data to the statistics API endpoint
      const statisticsResponse = await axios.post(`http://127.0.0.1:5003/describe`, data);
      console.log(statisticsResponse.data.description);
      return {
        isOk: true,
        message: 'Data described successfully',
        description: statisticsResponse.data.description
      };
    } else {
      console.log("Can not get data");
      return {
        isOk: false,
        message: 'Can not get data',
        description: null ,
      };
    }

    // Return the result from the statistics API
  } catch (error) {
    console.error('Error describing data:', error);
    return {
      isOk: false,
      message: error.response ? error.response.data.message : error.message
    };
  }
},


// Perform ANOVA
async performAnova(params) {
  try {
    const { input_batch_id, project_id, criterion_id } = params;
    const token = localStorage.getItem('token');
    
    // Fetch data from API_BASE_URL
    const response = await axios.get(`http://localhost:8083/api/projectDetail/getInputBatch/?input_batch_id=${input_batch_id}&project_id=${project_id}&criterion_id=${criterion_id}`, {
      headers: {
        'Authorization': `${token}`
      }
    });

    // Extract data from the response
    const data = response.data;

    // Send the fetched data to the statistics API endpoint
    const statisticsResponse = await axios.post(`http://127.0.0.1:5003/anova`, data);
    console.log(statisticsResponse);
    
    // Return the result from the statistics API
    return {
      isOk: true,
      message: 'ANOVA analysis performed successfully',
      result: statisticsResponse.data.result
    };
  } catch (error) {
    console.error('Error performing ANOVA:', error);
    return {
      isOk: false,
      message: error.response ? error.response.data.message : error.message
    };
  }
},

// Perform Tukey HSD test
async performTukeyTest(params) {
  try {
    const { input_batch_id, project_id, criterion_id } = params;
    const token = localStorage.getItem('token');
    
    // Fetch data from API_BASE_URL
    const response = await axios.get(`http://localhost:8083/api/projectDetail/getInputBatch/?input_batch_id=${input_batch_id}&project_id=${project_id}&criterion_id=${criterion_id}`, {
      headers: {
        'Authorization': `${token}`
      }
    });

    // Extract data from the response
    const data = response.data;

    // Send the fetched data to the statistics API endpoint
    const statisticsResponse = await axios.post(`http://127.0.0.1:5003/tukey`, data);

    // Return the result from the statistics API
    return {
      isOk: true,
      message: 'Tukey test performed successfully',
      result: statisticsResponse.data.result
    };
  } catch (error) {
    console.error('Error performing Tukey test:', error);
    return {
      isOk: false,
      message: error.response ? error.response.data.message : error.message
    };
  }
},

// Perform T-test
async performTTest(params) {
  try {
    const { input_batch_id, project_id, criterion_id } = params;
    const token = localStorage.getItem('token');
    
    // Fetch data from API_BASE_URL
    const response = await axios.get(`http://localhost:8083/api/projectDetail/getInputBatch/?input_batch_id=${input_batch_id}&project_id=${project_id}&criterion_id=${criterion_id}`, {
      headers: {
        'Authorization': `${token}`
      }
    });

    // Extract data from the response
    const data = response.data;

    // Send the fetched data to the statistics API endpoint
    const statisticsResponse = await axios.post(`http://127.0.0.1:5003/t_test`, data);

    // Return the result from the statistics API
    return {
      isOk: true,
      message: 'T-test performed successfully',
      result: statisticsResponse.data.result
    };
  } catch (error) {
    console.error('Error performing T-test:', error);
    return {
      isOk: false,
      message: error.response ? error.response.data.message : error.message
    };
  }
}

};