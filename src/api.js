const SERVER_PORT = '3001';
const BASE_URL = 'http://localhost:' + SERVER_PORT;

const Options = {
    GET: {
        method: 'GET',
    },

    POST: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    },

    DELETE: {
        method: 'DELETE',
    },
};

const ErrorText = {
    GET_DATA: 'Не удалось загрузить данные. Попробуйте обновить страницу',
    SEND_DATA: 'Не удалось отправить данные. Попробуйте ещё раз',
    DELETE_DATA: 'Не удалось удалить данные. Попробуйте ещё раз',
};

const makeRequest = (props, errText, url, body) => {
    const init = { ...props };
    const method = props.method;

    if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
        init.body = (typeof body === 'string') ? body : JSON.stringify(body);
    }

    return fetch(`${BASE_URL}${url}`, init).then((response) => {
        if (!response.ok) {
            throw new Error();
        }
        if (response.status === 204) {
            return true;
        }

        return response.json();
    })
        .catch(() => {
            throw new Error(errText);
        });
}

const getData = async (path) => await makeRequest (Options.GET, ErrorText.GET_DATA, path);
const sendData = async (path, data) => await makeRequest (Options.POST, ErrorText.SEND_DATA, path, data);
const deleteData = async (path) => await makeRequest (Options.DELETE, ErrorText.DELETE_DATA, path);

export {
    getData,
    sendData,
    deleteData
};
