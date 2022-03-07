import axios from 'axios';
import {
  jest, describe, test, expect,
} from '@jest/globals';
import {
  makeQueryAPICall, makeDetailAPICall, ITEMS_PER_PAGE, ERROR_CODE,
} from '../DataManager';
import token from '../api_token/token';
import 'regenerator-runtime/runtime';

jest.mock('axios');
jest.mock('../api_token/token', () => 'mock-token');

describe('makeQueryAPICall', () => {
  // Mock function params
  const currentPage = 14;
  const searchTerm = 'apache';

  // Mock returned data
  const response = {
    status: 200,
    headers: { 'x-ratelimit-remaining': 10 },
    data: 'mock data',
  };

  test('Makes API call to GitHub, with correct query params', async () => {
    axios.mockResolvedValue(response);
    await makeQueryAPICall(searchTerm, currentPage);

    expect(axios).toHaveBeenCalledWith({
      method: 'get',
      url: `https://api.github.com/search/repositories?q=${searchTerm}&sort=stars&order=desc&per_page=${ITEMS_PER_PAGE}&page=${currentPage}&accept=application/vnd.github.v3+json`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  });

  test('When the request is successfull, set data which comes from the response', async () => {
    axios.mockResolvedValue(response);
    const { errorCode, responseData } = await makeQueryAPICall(searchTerm, currentPage);
    expect(errorCode).toBeNull();
    expect(responseData).toBeDefined();
  });

  test('When rate limit is reached', async () => {
    const rateLimitResponse = {
      headers: { 'x-ratelimit-remaining': 0 },
    };
    axios.mockResolvedValue(rateLimitResponse);
    const { errorCode } = await makeQueryAPICall(searchTerm, currentPage);
    expect(errorCode).toEqual(ERROR_CODE.RATE_LIMIT);
  });

  test('When request fails due to empty query', async () => {
    const errorResponse = {
      response: {
        status: 422,
      },
    };
    axios.mockRejectedValue(errorResponse);
    const { errorCode } = await makeQueryAPICall(searchTerm, currentPage);
    expect(errorCode).toEqual(ERROR_CODE.EMPTY_SEARCH_TERM);
  });

  test('When request fails due to other errros', async () => {
    const errorResponse = {
      response: {
        status: 503,
      },
    };
    axios.mockRejectedValue(errorResponse);
    const { errorCode } = await makeQueryAPICall(searchTerm, currentPage);
    expect(errorCode).toEqual(ERROR_CODE.OTHER);
  });
});

describe('makeDetailAPICall', () => {
  // Mock function params
  const commitsUrl = 'https://api.github.com/repos/apache/echarts/commits';
  const forksUrl = 'https://api.github.com/repos/apache/echarts/forks';
  const ownerUrl = 'https://api.github.com/users/apache';

  // mock return values
  //   axios.get.mockImplementation((url) => {
  //     console.log('url', url);
  //     switch (url) {
  //       case commitsUrl:
  //         return Promise.resolve({
  //           status: 'fulfilled',
  //           value: {
  //             data: [{
  //               commit: { author: { name: 'Test User1' } },
  //             }, {
  //               commit: { author: { name: 'Test User2' } },
  //             }, {
  //               commit: { author: { name: 'Test User3' } },
  //             }],
  //           },
  //         });
  //       case forksUrl:
  //         return Promise.resolve({
  //           status: 'fulfilled',
  //           value: {
  //             data: [{
  //               name: 'testUserName',
  //             }],
  //           },
  //         });
  //       case ownerUrl:
  //         return Promise.resolve({
  //           status: 'fulfilled',
  //           value: {
  //             data: {
  //               bio: 'A Test Bio',
  //             },
  //           },
  //         });
  //       default:
  //         return Promise.reject(new Error('not found'));
  //     }
  //   });

  test('Makes API call to GitHub, with correct query params', async () => {
    const item = {
      commits_url: commitsUrl,
      forks_url: forksUrl,
      owner: {
        url: ownerUrl,
      },
    };
    const response = {
      data: {
        bio: 'A Test Bio',
      },
    };
    axios.mockResolvedValue(response);
    await makeDetailAPICall(item);

    expect(axios).toHaveBeenCalled();
  });

  //   test('Fetch forks info', () => {
  //     // TODO: assert that it calls axios with correct info
  //   });

  //   test('Fetch owner info', () => {
  //     // TODO: assert that it calls axios with correct info
  //   });

  //   describe('When all calls are successful', () => {
  //     test('Returns with info', () => {
  //       // TODO: assert return value of makeDetailAPICall
  //     });
  //   });

  //   describe('When fetching commits info fails', () => {
  //     // TODO
  //   });

  //   describe('When fetching forks info fails', () => {
  //     // TODO
  //   });

//   describe('When fetching owner info fails', () => {
//     // TODO
//   });
});
