const SERVER_PORT = '3001';
const BASE_URL = 'http://localhost:' + SERVER_PORT;

const Options = {
    GET: {
        method: 'GET',
        body: null,
    },

    POST: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    },
};

const ErrorText = {
    GET_DATA: 'Не удалось загрузить данные. Попробуйте обновить страницу',
    SEND_DATA: 'Не удалось отправить данные. Попробуйте ещё раз',
};

const makeRequest = (props, errText, url, body = null) =>
    fetch(`${BASE_URL}${url}`, {body, ...props}).then((response) => {
    if (!response.ok) {
        throw new Error();
    }

    return response.json();
})
    .catch(() => {
        throw new Error(errText);
    });

const getData = async (path) => await makeRequest (Options.GET, ErrorText.GET_DATA, path);
const sendData = async (path, data) => await makeRequest (Options.POST, ErrorText.SEND_DATA, path, data);

export {
    getData,
    sendData
};
