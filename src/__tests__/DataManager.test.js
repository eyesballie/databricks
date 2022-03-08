import axios from 'axios';
import {
  jest, describe, test, expect,
} from '@jest/globals';
import { when } from 'jest-when';
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

  const requests = [{
    method: 'get',
    url: commitsUrl,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }, {
    method: 'get',
    url: forksUrl,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }, {
    method: 'get',
    url: ownerUrl,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }];

  // The param when making function call
  const item = {
    commits_url: commitsUrl,
    forks_url: forksUrl,
    owner: {
      url: ownerUrl,
    },
  };

  test('When fetching commits info fails, return empty results', async () => {
    when(axios).calledWith({
      method: 'get',
      url: commitsUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 0, requests).mockRejectedValue(
      'There\'s something wrong',
    );

    const { lastCommitUsers } = await makeDetailAPICall(item);
    expect(lastCommitUsers).toEqual('');
  });

  test('When fetching commits info succeeds, return expected results', async () => {
    when(axios).calledWith({
      method: 'get',
      url: commitsUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 0, requests).mockReturnValue({
      data: [{
        commit: { author: { name: 'Test User1' } },
      }, {
        commit: { author: { name: 'Test User2' } },
      }, {
        commit: { author: { name: 'Test User3' } },
      }],
    });

    const { lastCommitUsers } = await makeDetailAPICall(item);
    expect(lastCommitUsers).toEqual('Test User1, Test User2, Test User3');
  });

  test('When fetching fork info fails, return empty results', async () => {
    when(axios).calledWith({
      method: 'get',
      url: forksUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 1, requests).mockRejectedValue(
      'There\'s something wrong',
    );

    const { lastForkUser } = await makeDetailAPICall(item);
    expect(lastForkUser).toEqual('');
  });

  test('When fetching fork info succeeds, return expected results', async () => {
    when(axios).calledWith({
      method: 'get',
      url: forksUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 1, requests).mockReturnValue({
      data: [{
        name: 'testUserName',
      }],
    });

    const { lastForkUser } = await makeDetailAPICall(item);
    expect(lastForkUser).toEqual('testUserName');
  });

  test('When fetching owner bio fails, return empty results', async () => {
    when(axios).calledWith({
      method: 'get',
      url: ownerUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 2, requests).mockRejectedValue(
      'There\'s something wrong',
    );

    const { ownerBio } = await makeDetailAPICall(item);
    expect(ownerBio).toEqual('');
  });

  test('When fetching owner bio succeeds, return expected results', async () => {
    when(axios).calledWith({
      method: 'get',
      url: ownerUrl,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 2, requests).mockReturnValue({
      data: {
        bio: 'A Test Bio',
      },
    });

    const { ownerBio } = await makeDetailAPICall(item);
    expect(ownerBio).toEqual('A Test Bio');
  });
});
