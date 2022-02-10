import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import RepoTable from './RepoTable';
import { makeQueryAPICall, ITEMS_PER_PAGE, ERROR_CODE } from './DataManager';

const MAX_RESPONSE_COUNT = 1000;
const FIRST_PAGE = 1;

function sanitizeQuery(str) {
  return str.replace(/[^\w. ]/gi, (c) => `&#${c.charCodeAt(0)};`);
}

function getSanitizeSearchTerm() {
  return sanitizeQuery(document.getElementById('searchText').value);
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState(null);
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onButtonClick = async (targetPage) => {
    setIsLoading(true);
    setData(null);
    setErrorMsg(null);
    const { errorCode, responseData } = await makeQueryAPICall(getSanitizeSearchTerm(), targetPage);

    switch (errorCode) {
      case ERROR_CODE.EMPTY_SEARCH_TERM:
        setErrorMsg('Please type in a search query');
        break;
      case ERROR_CODE.RATE_LIMIT:
        setErrorMsg('Please type in a search query');
        break;
      case ERROR_CODE.OTHER:
        setErrorMsg('Something went wrong, please try again');
        break;
      default:
        setData(responseData);
    }
    setIsLoading(false);
    setCurrentPage(targetPage);
  };

  const onSubmit = () => {
    setQuery(getSanitizeSearchTerm());
    onButtonClick(FIRST_PAGE);
  };

  const onClickPrev = () => {
    const targetPage = currentPage - 1;
    onButtonClick(targetPage);
  };

  const onClickNext = () => {
    const targetPage = currentPage + 1;
    onButtonClick(targetPage);
  };

  const isPrevDisabled = () => query == null || currentPage === FIRST_PAGE || isLoading;

  const isNextDisabled = () => {
    if (query == null || data?.total_count == null || isLoading) {
      return true;
    }
    if (data.total_count > MAX_RESPONSE_COUNT) {
      return currentPage >= MAX_RESPONSE_COUNT / ITEMS_PER_PAGE;
    }
    return currentPage >= Math.ceil(data.total_count / ITEMS_PER_PAGE);
  };

  return (
    <Container>
      <Card>
        <Card.Body>
          <Card.Title>Github Repository List</Card.Title>
        </Card.Body>
      </Card>
      <br />
      <>
        <Form.Control
          type="text"
          id="searchText"
          data-testid="searchText-input"
          aria-describedby="passwordHelpBlock"
        />
        <Button variant="primary" onClick={onSubmit} disabled={isLoading} data-testid="submit-button">Submit</Button>
        <Button variant="primary" onClick={onClickPrev} disabled={isPrevDisabled()} data-testid="prev-button">prev</Button>
        <Button variant="primary" onClick={onClickNext} disabled={isNextDisabled()} data-testid="next-button">next</Button>
      </>
      <br />
      {errorMsg == null ? <RepoTable items={data?.items} /> : <Alert variant="danger">{errorMsg}</Alert>}
    </Container>
  );
}
