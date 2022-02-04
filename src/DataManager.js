import axios from 'axios';
import token from './api_token/token';

const ITEMS_PER_PAGE = 10;
const FULFILLED_STATUS = 'fulfilled';

function getConfig(url) {
  return {
    method: 'get',
    url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function makeQueryAPICall(searchTerm, currentPage, setData, setErrorMsg, setIsLoading) {
  const config = getConfig(`https://api.github.com/search/repositories?q=${searchTerm}&sort=stars&order=desc&per_page=${ITEMS_PER_PAGE}&page=${currentPage}&accept=application/vnd.github.v3+json`);
  let response;
  try {
    setIsLoading(true);
    response = await axios(config);
    if (response.headers['x-ratelimit-remaining'] === 0) {
      setErrorMsg('Reached API rate limit, please try again later');
    } else if (setData != null) {
      setData(response.data);
    }
  } catch (error) {
    if (error.response.status === 422) {
      setErrorMsg('Please type in a search query');
    } else {
      setErrorMsg('Something went wrong, please try again');
    }
  }
  setIsLoading(false);
  return response;
}

async function makeDetailAPICall(item, setLoading) {
  const requests = [];
  requests.push(getConfig(item.commits_url.replace(/{.*}/, '')));
  requests.push(getConfig(item.forks_url));
  requests.push(getConfig(item.owner.url));

  const tasks = requests.map(axios);
  const responses = await Promise.allSettled(tasks);
  let lastCommitUsers = '';
  if (responses[0].status === FULFILLED_STATUS) {
    const limit = Math.min(responses[0].value.data.length, 3);
    for (let j = 0; j < limit; j += 1) {
      lastCommitUsers = lastCommitUsers.concat(responses[0].value.data[j].commit?.author?.name);
      if (j !== limit - 1) {
        lastCommitUsers = lastCommitUsers.concat(', ');
      }
    }
  }
  const lastForkUser = responses[1].status === FULFILLED_STATUS ? responses[1].value.data[0]?.name : '';
  const ownerBio = responses[2].status === FULFILLED_STATUS ? responses[2].value.data?.bio : '';
  setLoading(false);
  return { lastCommitUsers, lastForkUser, ownerBio };
}

export { makeQueryAPICall, makeDetailAPICall, ITEMS_PER_PAGE };
