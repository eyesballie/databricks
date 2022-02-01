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

function makeQueryAPICall(currentPage, setData, setErrorMsg) {
  const config = getConfig(`https://api.github.com/search/repositories?q=${document.getElementById('searchText').value}&sort=stars&order=desc&per_page=${ITEMS_PER_PAGE}&page=${currentPage}&accept=application/vnd.github.v3+json`);
  axios(config)
    .then((response) => {
      if (setData != null) {
        setData(response.data);
      }
    })
    .catch((error) => {
      if (error.response.status === 422) {
        setErrorMsg('Please type in a search query');
      } else if (error.response.status === 403) {
        setErrorMsg('API rate limit exceed, please try again later');
      } else {
        setErrorMsg('Something went wrong, please try again');
      }
    });
}

async function makeDetailAPICall(items, setDetails) {
  const requests = [];
  let lastCommitUsers;
  let lastForkUser;
  let ownerBio;
  items.forEach((item) => {
    requests.push(getConfig(item.commits_url.replace(/{.*}/, '')));
    requests.push(getConfig(item.forks_url));
    requests.push(getConfig(item.owner.url));
  });

  const tasks = requests.map(axios);
  const responses = await Promise.allSettled(tasks);
  const details = [];
  for (let i = 0; i < responses.length; i += 3) {
    if (responses[i].status === FULFILLED_STATUS) {
      lastCommitUsers = '';
      const limit = Math.min(responses[i].value.data.length, 3);
      for (let j = 0; j < limit; j += 1) {
        lastCommitUsers = lastCommitUsers.concat(responses[i].value.data[j].commit?.author?.name);
        if (j !== limit - 1) {
          lastCommitUsers = lastCommitUsers.concat(', ');
        }
      }
    }
    lastForkUser = responses[i + 1].status === FULFILLED_STATUS ? responses[i + 1].value.data[0]?.name : '';
    ownerBio = responses[i + 2].status === FULFILLED_STATUS ? responses[i + 2].value.data?.bio : '';
    details.push({ lastCommitUsers, lastForkUser, ownerBio });
  }
  setDetails(details);
}

export { makeQueryAPICall, makeDetailAPICall, ITEMS_PER_PAGE };
