import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import {
  jest, describe, test, expect,
} from '@jest/globals';
import React from 'react';
import { makeQueryAPICall } from '../DataManager';
import App from '../App';

jest.mock('../DataManager');

async function renderAndSubmitNewMockQueryAPICall(searchTerm) {
  // Mock outgoing call
  makeQueryAPICall.mockResolvedValue({});

  // Render app & interact
  render(<App />);
  userEvent.type(screen.getByTestId('searchText-input'), searchTerm);
  userEvent.click(screen.getByTestId('submit-button'));

  // Wait for submit button is available again, that happens when search results are returned
  await waitFor(() => expect(screen.getByTestId('submit-button')).toBeEnabled(), {
    timeout: 5000,
  });
}

describe('When user submit submit a new search', () => {
  test('Makes query API call with correct params', async () => {
    const searchTerm = 'javascript';
    await renderAndSubmitNewMockQueryAPICall(searchTerm);

    expect(makeQueryAPICall).toHaveBeenCalledWith(searchTerm, 1);
  });

  test('Previous button is disabled on the first page', async () => {
    await renderAndSubmitNewMockQueryAPICall('javascript');

    expect(screen.getByTestId('prev-button')).toBeDisabled();
  });

  test('Next button is enabled when there is next page to paginate to', () => {
    // TODO
  });

  test('Next button is disabled when this is the last page', () => {
    // TODO
  });

  describe('When an error is set', () => {
    test('Error message is displayed', () => {
      // TODO
    });
  });
});
