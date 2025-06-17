// Frontend test validating the summary download button triggers API call
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SummaryDownloadPage from '../frontend/app/(user)/journal-summaries/[id]/page';

// Mock the api client that performs the download
jest.mock('../frontend/services/apiClient', () => ({
  downloadSummaryPDF: jest.fn(() => Promise.resolve(new Blob(['pdf'])))
}));

const { downloadSummaryPDF } = require('../frontend/services/apiClient');

test('clicking download button invokes service', async () => {
  render(<SummaryDownloadPage params={{ id: '123' }} />);
  fireEvent.click(screen.getByText('Download PDF'));
  await waitFor(() => expect(downloadSummaryPDF).toHaveBeenCalled());
});

