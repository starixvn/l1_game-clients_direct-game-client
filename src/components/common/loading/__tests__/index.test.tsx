import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loading from '../index';

describe('Loading Component', () => {
    // Happy Path
    it('should render the loading component', () => {
        // Arrange & Act
        render(<Loading />);

        // Assert
        const loaderElement = screen.getByTestId('loader');
        expect(loaderElement).toBeInTheDocument();
    });

    // Element Properties
    it('should have the correct CSS class', () => {
        // Arrange & Act
        render(<Loading />);

        // Assert
        const loaderElement = screen.getByTestId('loader');
        expect(loaderElement).toHaveClass('loader');
    });

    // Snapshot Testing
    it('should match snapshot', () => {
        // Arrange & Act
        const { container } = render(<Loading />);

        // Assert
        expect(container.firstChild).toMatchSnapshot();
    });
});
