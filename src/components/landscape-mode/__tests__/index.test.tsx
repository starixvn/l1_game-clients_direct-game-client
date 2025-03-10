import React from 'react';
import { render, screen, act } from '@testing-library/react';
import LandscapeMode from '../index';
import { useTranslator } from '../../../_shared/react-hooks';
import { deviceInfo } from '../../../_shared/utils/device-detect-wrapper';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../../../_shared/react-hooks', () => ({
    useTranslator: jest.fn()
}));

jest.mock('../../../_shared/utils/device-detect-wrapper', () => ({
    deviceInfo: {
        isMobileOnly: false
    }
}));

// Mock translation function
const mockTranslator = {
    t: jest.fn().mockReturnValue('Rotate your device')
};

describe('LandscapeMode', () => {
    // Setup before each test
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        (useTranslator as jest.Mock).mockReturnValue(mockTranslator);

        // Mock window dimensions
        global.innerWidth = 800;
        global.innerHeight = 600;
    });

    describe('Device Detection', () => {
        it('should not render on non-mobile devices', () => {
            // Arrange
            (deviceInfo as any).isMobileOnly = false;

            // Act
            render(<LandscapeMode />);

            // Assert
            expect(screen.queryByTestId('landscape-mode-component')).not.toBeInTheDocument();
        });

        it('should render on mobile devices in landscape mode', () => {
            // Arrange
            (deviceInfo as any).isMobileOnly = true;
            global.innerWidth = 800;
            global.innerHeight = 400;

            // Act
            render(<LandscapeMode />);

            // Assert
            expect(screen.getByTestId('landscape-mode-component')).toBeInTheDocument();
            expect(screen.getByText('Rotate your device')).toBeInTheDocument();
            expect(screen.getByAltText('landscape-icon')).toBeInTheDocument();
        });

        it('should not render on mobile devices in portrait mode', () => {
            // Arrange
            (deviceInfo as any).isMobileOnly = true;
            global.innerWidth = 400;
            global.innerHeight = 800;

            // Act
            render(<LandscapeMode />);

            // Assert
            expect(screen.queryByTestId('landscape-mode-component')).not.toBeInTheDocument();
        });
    });

    describe('Orientation Change Handler', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should update orientation after orientation change event', () => {
            // Arrange
            (deviceInfo as any).isMobileOnly = true;
            global.innerWidth = 400;
            global.innerHeight = 800;

            // Act
            render(<LandscapeMode />);

            // Simulate changing to landscape
            global.innerWidth = 800;
            global.innerHeight = 400;

            // Trigger orientation change
            act(() => {
                window.dispatchEvent(new Event('orientationchange'));
                jest.advanceTimersByTime(200);
            });

            // Assert
            expect(screen.getByTestId('landscape-mode-component')).toBeInTheDocument();
        });

        it('should clean up event listener on unmount', () => {
            // Arrange
            (deviceInfo as any).isMobileOnly = true;
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            // Act
            const { unmount } = render(<LandscapeMode />);
            unmount();

            // Assert
            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                'orientationchange',
                expect.any(Function)
            );
        });
    });

    describe('Translation', () => {
        it('should use the correct translation key', () => {
            // Arrange
            (deviceInfo as any).isMobileOnly = true;
            global.innerWidth = 800;
            global.innerHeight = 400;

            // Act
            render(<LandscapeMode />);

            // Assert
            expect(mockTranslator.t).toHaveBeenCalledWith('rotateDevice');
        });
    });
});