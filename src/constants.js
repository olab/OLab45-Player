// Constants.js
const prod = {
    API_URL: 'https://dev.olab.ca/olab/api/v3'
};

const dev = {
    API_URL: 'https://localhost:5001/olab/api/v3'
};

export const config = process.env.NODE_ENV === 'development' ? dev : prod;
