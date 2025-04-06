// API utility functions for the application

/**
 * Makes a POST request to the API
 * @param endpoint The API endpoint to call
 * @param data The data to send in the request
 * @returns Promise with the response data
 */
export async function postToApi(endpoint: string, data: any): Promise<any> {
  try {
    // In Expo, we need to use the full URL or a relative path that includes the hostname
    // Convert relative API paths to use the app's own base URL
    const apiUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `${window.location.origin}${endpoint}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
} 