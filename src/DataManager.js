import axios from 'axios';
import token from './api_token/token';

const ITEMS_PER_PAGE = 10;
const FULFILLED_STATUS = 'fulfilled';
const ERROR_CODE = {
  EMPTY_SEARCH_TERM: 'EMPTY_SEARCH_TERM',
  RATE_LIMIT: 'RATE_LIMIT',
  OTHER: 'OTHER',
};

function getConfig(url) {
  return {
    method: 'get',
    url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function makeQueryAPICall(searchTerm, currentPage) {
  const config = getConfig(`https://api.github.com/search/repositories?q=${searchTerm}&sort=stars&order=desc&per_page=${ITEMS_PER_PAGE}&page=${currentPage}&accept=application/vnd.github.v3+json`);
  let response;
  let errorCode = null;
  try {
    response = await axios(config);
    if (response.headers['x-ratelimit-remaining'] === 0) {
      errorCode = ERROR_CODE.RATE_LIMIT;
    }
  } catch (error) {
    if (error.response.status === 422) {
      errorCode = ERROR_CODE.EMPTY_SEARCH_TERM;
    } else {
      errorCode = ERROR_CODE.OTHER;
    }
  }

  return {
    errorCode,
    responseData: response?.data,
  };
}

async function makeDetailAPICall(item) {
  const requests = [];
  requests.push(getConfig(item.commits_url.replace(/{.*}/, '')));
  requests.push(getConfig(item.forks_url));
  requests.push(getConfig(item.owner.url));
  console.log('requests', requests);
  const tasks = requests.map(axios);
  const responses = await Promise.allSettled(tasks);
  console.log('responses', responses);
  let lastCommitUsers = '';
  if (responses[0].status === FULFILLED_STATUS) {
    const limit = (responses[0].value == null || responses[0].value.data == null)
      ? 0
      : Math.min(responses[0].value.data.length, 3);
    for (let j = 0; j < limit; j += 1) {
      lastCommitUsers = lastCommitUsers.concat(responses[0].value.data[j].commit?.author?.name);
      if (j !== limit - 1) {
        lastCommitUsers = lastCommitUsers.concat(', ');
      }
    }
  }
  const lastForkUser = responses[1].status === FULFILLED_STATUS ? responses[1].value?.data[0]?.name : '';
  const ownerBio = responses[2].status === FULFILLED_STATUS ? responses[2].value?.data?.bio : '';
  return { lastCommitUsers, lastForkUser, ownerBio };
}

export {
  makeQueryAPICall, makeDetailAPICall, ITEMS_PER_PAGE, ERROR_CODE,
};
