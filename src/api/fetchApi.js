const fetchApi = async (...args) => {
    const [method, url, token, isForm, body, resType, contentType] = args;

    let headers = {};

    if (token) {
        headers['Authorization'] = "Bearer " + token;
    }

    if (!isForm) {
        headers['Content-Type'] = contentType || 'application/json';
    }

    let options = {
        method,
        headers,
    };

    if (body) {
        options.body = isForm ? body : JSON.stringify(body);
    }

    const response = await fetch(url, options);
    return resType ? response.blob() : response.json();
};

export { fetchApi };
