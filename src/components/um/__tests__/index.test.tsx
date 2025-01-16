import React from 'react';
import { render, screen } from '@testing-library/react';
import UM from '../index';
import { UMInfo } from 'sc-user-service-client/dist/auth';
import * as translatorHook from '../../../_shared/react-hooks/use-translator';
import '@testing-library/jest-dom';

// Mock the translator hook
jest.mock('../../../_shared/react-hooks/use-translator', () => ({
    useTranslator: jest.fn()
}));

describe('UM Component', () => {
    const mockTranslate = jest.fn((key: string) => key);

    beforeEach(() => {
        jest.spyOn(translatorHook, 'useTranslator').mockImplementation(() => ({
            t: mockTranslate,
            i18n: {},
            ready: true
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should not render anything when umInfo is null', () => {
        const { container } = render(<UM umInfo={null as unknown as UMInfo} />);
        expect(container.firstChild).toMatchSnapshot();
    });

    it('should render maintenance information correctly with both start and end times', () => {
        const mockUMInfo: UMInfo = {
            startTime: new Date('2024-03-20T10:00:00Z'),
            endTime: new Date('2024-03-20T12:00:00Z'),
            operatorId: 'test-operator'
        };

        render(<UM umInfo={mockUMInfo} />);

        // Check if maintenance icon is rendered
        const maintenanceIcon = screen.getByAltText('Image');
        expect(maintenanceIcon).toBeInTheDocument();
        expect(maintenanceIcon.getAttribute('src')).toBe('/images/um/maintence-icon.png');

        // Check if title and timezone are rendered
        expect(screen.getByText('maintenance_time')).toBeInTheDocument();
        expect(screen.getByText('(GMT + 8)')).toBeInTheDocument();

        // Check if time information is rendered correctly
        expect(screen.getByText('from')).toBeInTheDocument();
        expect(screen.getByText('to')).toBeInTheDocument();
    });

    it('should render maintenance information with only start time', () => {
        const mockUMInfo: UMInfo = {
            startTime: new Date('2024-03-20T10:00:00Z'),
            endTime: null as unknown as Date,
            operatorId: 'test-operator'
        };

        render(<UM umInfo={mockUMInfo} />);
        expect(screen.getByText('from')).toBeInTheDocument();
        expect(screen.queryByText('to')).not.toBeInTheDocument();
    });

    it('should render maintenance information with only end time', () => {
        const mockUMInfo: UMInfo = {
            startTime: null as unknown as Date,
            endTime: new Date('2024-03-20T12:00:00Z'),
            operatorId: 'test-operator'
        };

        render(<UM umInfo={mockUMInfo} />);
        expect(screen.queryByText('from')).not.toBeInTheDocument();
        expect(screen.getByText('to')).toBeInTheDocument();
    });

    it('should convert time to GMT+8 correctly', () => {
        const mockUMInfo: UMInfo = {
            startTime: new Date('2024-03-20T10:00:00Z'),
            endTime: new Date('2024-03-20T12:00:00Z'),
            operatorId: 'test-operator'
        };

        render(<UM umInfo={mockUMInfo} />);

        // Note: The actual time strings will depend on the timezone conversion
        // We're testing that the time format matches our expected pattern
        const timeElements = screen.getAllByText(/\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}/);
        expect(timeElements.length).toBeGreaterThan(0);
    });
}); 