import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { configureStore } from '@reduxjs/toolkit';
import ViewTestimony from './ViewTestimony'; // Adjust the import path as needed

// Mock the external hooks and context providers
jest.mock('../auth', () => ({
  useAuth: jest.fn(() => ({ user: { uid: '123', /* other user properties */ } })),
}));

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

beforeAll(() => {
  window.matchMedia = jest.fn().mockImplementation(query => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };
  });
});

// Mock reducer for publish
const mockPublishReducer = (state = { service: {} }) => state;

// Create a mock Redux store
const mockStore = configureStore({ 
  reducer: {
    // your other reducers
    publish: mockPublishReducer,
  },
});

// Create a new QueryClient instance
const queryClient = new QueryClient();

describe('ViewTestimony Component', () => {
  const mockProps = {
    items: {
      result: [
        { 
          authorUid: '123', 
          billId: 'bill1', 
          publishedAt: { toDate: () => new Date('2021-01-01') }, // Mocked Firestore Timestamp
          authorRole: 'user' 
        },
        { 
          authorUid: '456', 
          billId: 'bill2', 
          publishedAt: { toDate: () => new Date('2021-02-01') }, // Mocked Firestore Timestamp
          authorRole: 'organization' 
        }
      ],
    },
    setFilter: jest.fn(),
    pagination: {
      currentPage: 1,
      hasNextPage: true,
      hasPreviousPage: false,
      itemsPerPage: 2,
      totalItems: 4,
    },
    onProfilePage: false,
    className: 'test-class',
    isOrg: false,
  };

  beforeEach(() => {
    // Reset or re-initialize mocks if needed
  });

  afterEach(cleanup);

  // Test for initial rendering
  it('renders correctly', () => {
    const { getByText } = render(
      <ReduxProvider store={mockStore}>
        <QueryClientProvider client={queryClient}>
          <ViewTestimony {...mockProps} />
        </QueryClientProvider>
      </ReduxProvider>
    );
    expect(getByText('Testimonies')).toBeInTheDocument();
    // Add more assertions here as needed
  });

  // Test for tab functionality
  it('handles tab click correctly', () => {
    const { getByText } = render(
      <ReduxProvider store={mockStore}>
        <QueryClientProvider client={queryClient}>
          <ViewTestimony {...mockProps} />
        </QueryClientProvider>
      </ReduxProvider>
    );
    fireEvent.click(getByText('Individuals'));
    expect(mockProps.setFilter).toHaveBeenCalledWith({ authorRole: 'user' });
    // Add more assertions here to validate tab functionality
  });

  // Test for sorting functionality
  it('handles sorting', () => {
    const { container } = render(
      <ReduxProvider store={mockStore}>
        <QueryClientProvider client={queryClient}>
          <ViewTestimony {...mockProps} />
        </QueryClientProvider>
      </ReduxProvider>
    );
    const sortDropDown = container.querySelector('select');
    fireEvent.change(sortDropDown, { target: { value: 'Oldest First' } });
    // Add assertions here to check the ordering of items after sorting
  });

  // Test for pagination functionality
  it('handles pagination', () => {
    const { getByText } = render(
      <ReduxProvider store={mockStore}>
        <QueryClientProvider client={queryClient}>
          <ViewTestimony {...mockProps} />
        </QueryClientProvider>
      </ReduxProvider>
    );
    fireEvent.click(getByText('Next')); // Assuming 'Next' is the text for the next page button
    // Add assertions here to check the change in displayed items or page
  });

  // Additional tests can be added as needed
});

export {};