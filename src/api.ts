import type { HttpMethod, ApiOptions } from './types/index';

const SERVER_PORT = '3001';
const BASE_URL = 'http://localhost:' + SERVER_PORT;

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

const Options: Record<HttpMethod, ApiOptions> = {
    GET: { method: 'GET' },
    POST: { method: 'POST', headers: JSON_HEADERS },
    PATCH: { method: 'PATCH', headers: JSON_HEADERS },
    DELETE: { method: 'DELETE' },
};

type ErrorKey = 'GET_DATA' | 'SEND_DATA' | 'UPDATE_DATA' | 'DELETE_DATA';

const ErrorText: Record<ErrorKey, string> = {
    GET_DATA: 'Не удалось загрузить данные. Попробуйте обновить страницу',
    SEND_DATA: 'Не удалось отправить данные. Попробуйте ещё раз',
    UPDATE_DATA: 'Не удалось обновить данные. Попробуйте ещё раз',
    DELETE_DATA: 'Не удалось удалить данные. Попробуйте ещё раз',
};


const makeRequest = (
    props: ApiOptions,
    errText: string,
    url: string,
    body?: object | string): Promise<true | unknown> => {
    const init: RequestInit = { ...props };
    const method = props.method;

    if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
        init.body = (typeof body === 'string') ? body : JSON.stringify(body);
    }

    return fetch(`${BASE_URL}${url}`, init).then((response) => {
        if (!response.ok) throw new Error(`${errText} (HTTP ${response.status})`);
        return response.status === 204 ? true : response.json();

    });
}

const getData = <T>(path: string): Promise<T> => {
    return makeRequest(Options.GET, ErrorText.GET_DATA, path) as Promise<T>;
};
const sendData = (path: string, data: object | string): Promise<true | unknown> => makeRequest (Options.POST, ErrorText.SEND_DATA, path, data);
const updateData = (path: string, data: object | string): Promise<true | unknown> => makeRequest (Options.PATCH, ErrorText.UPDATE_DATA, path, data);
const deleteData = (path: string): Promise<true | unknown> => makeRequest (Options.DELETE, ErrorText.DELETE_DATA, path);

export {
    getData,
    sendData,
    updateData,
    deleteData
};
