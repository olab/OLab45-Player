// Constants.js
const prod = {
    API_URL: 'https://olabapi.azurewebsites.net/olab/api/v3',
    TTALK_HUB_URL: 'https://dev.olab.ca/olab/turktalk'
};

const dev = {
    API_URL: 'https://localhost:5001/olab/api/v3',
    TTALK_HUB_URL: 'https://localhost:5001/turktalk'
};

export const config = process.env.NODE_ENV === 'development' ? dev : prod;
