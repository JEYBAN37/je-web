type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const CONST_API_URL: string = 'http://localhost:8080';

export const apiRequest = async <T>(
  path: string,
  method: HttpMethod = 'POST',
  data?: any
): Promise<T> => {
  const token = localStorage.getItem("token");

  // Configuramos los headers dinámicamente
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // SI NO ES FormData, asumimos que es JSON y ponemos el header
  if (data && !(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && method !== 'GET') {
    // SI ES FormData, lo pasamos directo. SI NO, lo hacemos string.
    config.body = data instanceof FormData ? data : JSON.stringify(data);
  }

  console.log("API Request", `${data ? JSON.stringify(data) : 'No Body'}`);

  const response = await fetch(`${CONST_API_URL}${path}`, config);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    
    // Capturamos el detalle del primer error del array si existe
    let errorMessage = `Error: ${response.status}`;
    
    if (errorBody.errors && errorBody.errors.length > 0) {
      // Aquí extraemos "EstA compañia ya existe" del campo 'detail'
      errorMessage = errorBody.errors[0].detail || errorBody.errors[0].message;
    } else if (errorBody.message) {
      errorMessage = errorBody.message;
    }

    throw new Error(errorMessage);
  }

  return response.json();
};