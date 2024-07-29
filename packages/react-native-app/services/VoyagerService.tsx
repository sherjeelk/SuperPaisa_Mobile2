import axios from 'axios';

//const API_ENDPOINT = 'https://api.pf.testnet.routerprotocol.com/api'; // Replace with your actual API endpoint

const API_ENDPOINT = 'https://api-beta.pathfinder.routerprotocol.com/api/v2'; 

export const getQuote = async (quoteParams: any) => {
    try {
        console.log('Fetching quote with params:', quoteParams);
        const response = await axios.post(`${API_ENDPOINT}/get-quote`, quoteParams); // Ensure the endpoint is correct
        console.log('Quote response:', response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            // Server responded with a status other than 200 range
            console.error('Server responded with an error:', error.response.status, error.response.data);
        } else if (error.request) {
            // Request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an error
            console.error('Error setting up request:', error.message);
        }
        throw new Error('Network Error');
    }
};

export const checkAndSetAllowance = async (wallet: any, fromTokenAddress: string, allowanceTo: string, amount: string) => {
    // Your implementation here
};

export const getTransaction = async (quoteParams: any, quote: any) => {
    // Your implementation here
};

export const executeTransaction = async (wallet: any, txData: any) => {
    // Your implementation here
};
