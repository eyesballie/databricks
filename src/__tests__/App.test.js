import React from 'react';
import userEvent from '@testing-library/user-event';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import {
  jest, describe, test, expect, beforeEach,
} from '@jest/globals';
import App from '../App';
import { makeQueryAPICall, ERROR_CODE } from '../DataManager';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';

jest.mock('../DataManager');

const SEARCH_TERM = 'apache';

async function renderAndSubmitNewMockQueryAPICall(searchTerm, queryResult = {}) {
  // Mock outgoing call
  makeQueryAPICall.mockResolvedValue(queryResult);

  // Render app & interact
  render(<App />);
  userEvent.type(screen.getByTestId('searchText-input'), searchTerm);
  userEvent.click(screen.getByTestId('submit-button'));

  // wait for submit button is available agin, that happens when search results are returned
  await waitFor(() => expect(screen.getByTestId('submit-button')).toBeEnabled());
}

describe('When user submit a new search', () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Makes query API call with correct params', async () => {
    await renderAndSubmitNewMockQueryAPICall(SEARCH_TERM);
    expect(makeQueryAPICall).toHaveBeenCalledWith(SEARCH_TERM, 1);
  });

  test('Previous button is disabled on the first page', async () => {
    await renderAndSubmitNewMockQueryAPICall(SEARCH_TERM);
    expect(screen.getByTestId('prev-button')).toBeDisabled();
  });

  test('Next button is enabled when there is next page to paginate to', async () => {
    const queryResult = { errorCode: null, responseData: { total_count: 200 } };
    await renderAndSubmitNewMockQueryAPICall(SEARCH_TERM, queryResult);
    expect(screen.getByTestId('next-button')).toBeEnabled();
  });

  test('Next button is disabled when this is the last page', async () => {
    await renderAndSubmitNewMockQueryAPICall(SEARCH_TERM);
    expect(screen.getByTestId('next-button')).toBeDisabled();
  });

  // test('When an error is returned, alert the user', async () => {
  //   global.alert = jest.fn();
  //   const queryResult = { errorCode: ERROR_CODE.RATE_LIMIT, responseData: {} };
  //   await renderAndSubmitNewMockQueryAPICall(SEARCH_TERM, queryResult);
  //   expect(Alert).toHaveBeenCalledWith(SEARCH_TERM, 1);
  // });
});
