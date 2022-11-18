// Constants.js
const prod = {
    API_URL: 'https://olabprdapi.azurewebsites.net/olab/api/v3',
    TTALK_HUB_URL: 'https://dev.olab.ca/olab/turktalk'
};

const dev = {
    API_URL: 'http://localhost:7071/olab/api/v3',
    TTALK_HUB_URL: 'https://localhost:5001/turktalk'
};

export const config = process.env.NODE_ENV === 'development' ? dev : prod;
