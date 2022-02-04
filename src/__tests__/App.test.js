// import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  jest, describe, test, expect,
} from '@jest/globals';
import React from 'react';
// import { act } from 'react-dom/test-utils';
import { makeQueryAPICall } from '../DataManager';
import App from '../App';

jest.mock('../DataManager');

describe('When user submit submit a new search', () => {
  test('Makes query API call with correct params', () => {
    makeQueryAPICall.mockResolvedValue({});

    render(<App />);
    const searchTerm = 'javascript';
    const searchInput = screen.getByTestId('searchText-input');
    searchInput.value = searchTerm;

    fireEvent.click(screen.getByTestId('submit-button'));

    expect(makeQueryAPICall)
      .toHaveBeenCalledWith(searchTerm, 1, expect.anything(), expect.anything(), expect.anything());
  });

  test('Previous button is disabled on the first page', () => {
    // TODO
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
