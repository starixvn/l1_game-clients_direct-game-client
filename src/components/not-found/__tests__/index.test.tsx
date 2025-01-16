import { render, screen } from '@testing-library/react';
import NotFound from '../index';
import { useTranslator } from '../../../_shared/react-hooks';
import '@testing-library/jest-dom';

// Mock the useTranslator hook
jest.mock('../../../_shared/react-hooks', () => ({
    useTranslator: jest.fn()
}));

describe('NotFound Component', () => {
    // Mock translation function
    const mockTranslate = jest.fn((key, params) => {
        if (key === 'errorOccurred') {
            return `Error ${params.errorCode} occurred`;
        }
        return key;
    });

    beforeEach(() => {
        // Setup mock implementation before each test
        (useTranslator as jest.Mock).mockReturnValue({
            t: mockTranslate
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component with correct error image', () => {
        render(<NotFound />);

        const errorImage = screen.getByAltText('error');
        expect(errorImage).toBeInTheDocument();
        expect(errorImage).toHaveAttribute('src', '/images/error-light.svg');
        expect(errorImage).toHaveClass('error-background', 'small');
    });
    it('should render error message with correct translation', () => {
        render(<NotFound />);

        // Verify translation was called with correct parameters
        expect(useTranslator).toHaveBeenCalledWith(['messages']);
        expect(mockTranslate).toHaveBeenCalledWith('errorOccurred', { errorCode: 404 });

        // Verify the translated message is displayed
        const errorMessage = screen.getByText('Error 404 occurred');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('info');
    });

    it('should render with correct container class', () => {
        const { container } = render(<NotFound />);
        const errorPage = container.querySelector('.error-page');
        expect(errorPage).toBeInTheDocument();
    });
}); 