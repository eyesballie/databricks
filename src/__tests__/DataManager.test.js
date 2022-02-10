import axios from 'axios';
import {
  jest, describe, test, expect,
} from '@jest/globals';
import { makeQueryAPICall, ITEMS_PER_PAGE, ERROR_CODE } from '../DataManager';
import token from '../api_token/token';

jest.mock('axios');
jest.mock('../api_token/token', () => 'mock-token');

describe('makeQueryAPICall', () => {
  // Mock function params
  const setData = jest.fn();
  const setErrorMsg = jest.fn();
  const setIsLoading = jest.fn();
  const currentPage = 14;
  const searchTerm = 'javascript';

  // Mock returned data
  const response = {
    status: 200,
    headers: { 'x-ratelimit-remaining': 10 },
    data: 'mock data',
  };

  // Test that correct params are passed to external API call
  test('Makes API call to GitHub, with correct query params', async () => {
    axios.mockResolvedValue(response);
    await makeQueryAPICall(searchTerm, currentPage, setData, setErrorMsg, setIsLoading);

    expect(axios).toHaveBeenCalledWith({
      method: 'get',
      url: `https://api.github.com/search/repositories?q=${searchTerm}&sort=stars&order=desc&per_page=${ITEMS_PER_PAGE}&page=${currentPage}&accept=application/vnd.github.v3+json`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  });

  describe('When the request is successful', () => {
    test('Set data which comes from the response', async () => {
      axios.mockResolvedValue(response);
      const { errorCode, responseData } = await makeQueryAPICall(searchTerm, currentPage);
      expect(errorCode).toBeUndefined();
      expect(responseData).toBeDefined();
    });

    describe('When rate limit is reached', () => {
      const rateLimitResponse = {
        headers: { 'x-ratelimit-remaining': 0 },
      };

      test('Returns rate limit error code', async () => {
        axios.mockResolvedValue(rateLimitResponse);
        const { errorCode } = await makeQueryAPICall(searchTerm, currentPage);
        expect(errorCode).toEqual(ERROR_CODE.RATE_LIMIT);
      });
    });
  });

  describe('When the request fails with 422 status', () => {
    const errorResponse = {
      response: {
        status: 422,
      },
    };

    test('Returns empty query error code', async () => {
      axios.mockRejectedValue(errorResponse);
      const { errorCode } = await makeQueryAPICall(searchTerm, currentPage);
      expect(errorCode).toEqual(ERROR_CODE.EMPTY_SEARCH_TERM);
    });
  });

  describe('When the request fails with other statuses', () => {
    test('Set generic error message', async () => {
      // TODO
    });
  });
});

describe('makeDetailAPICall', () => {
  test('Fetch commits info', () => {
    // TODO: assert that it calls axios with correct info
  });

  test('Fetch forks info', () => {
    // TODO: assert that it calls axios with correct info
  });

  test('Fetch owner info', () => {
    // TODO: assert that it calls axios with correct info
  });

  describe('When all calls are successful', () => {
    test('Returns with info', () => {
      // TODO: assert return value of makeDetailAPICall
    });
  });

  describe('When fetching commits info fails', () => {
    // TODO
  });

  describe('When fetching forks info fails', () => {
    // TODO
  });

  describe('When fetching owner info fails', () => {
    // TODO
  });
});
