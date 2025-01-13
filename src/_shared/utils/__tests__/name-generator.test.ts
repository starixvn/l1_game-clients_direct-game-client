import NameGenerator from "../name-generator";
import { uniqueNamesGenerator } from "unique-names-generator";

// Mock the external dependency
jest.mock("unique-names-generator");

describe("NameGenerator", () => {
    beforeEach(() => {
        // Clear mock before each test
        jest.clearAllMocks();
    });

    describe("generateName", () => {
        it("should generate a valid name with numbers", () => {
            // Mock the uniqueNamesGenerator to return a known value
            (uniqueNamesGenerator as jest.Mock).mockReturnValue("test");

            // Mock Math.random to return predictable values
            const mockMath = Object.create(global.Math);
            mockMath.random = () => 0.5; // Will give us middle values
            global.Math = mockMath;

            const generatedName = NameGenerator.generateName();

            // Verify the name matches our pattern
            expect(generatedName).toMatch(new RegExp(NameGenerator.PATTERN));
            expect(uniqueNamesGenerator).toHaveBeenCalled();
        });

        it("should handle short names correctly", () => {
            (uniqueNamesGenerator as jest.Mock).mockReturnValue("cat");
            const mockMath = Object.create(global.Math);
            mockMath.random = () => 0.5;
            global.Math = mockMath;

            const generatedName = NameGenerator.generateName();

            // For short names (< 10 chars), should add up to 5 digits
            expect(generatedName.length).toBeLessThanOrEqual(8); // 3 chars + up to 5 digits
            expect(generatedName).toMatch(/^cat\d{1,5}$/);
        });

        it("should handle long names correctly", () => {
            (uniqueNamesGenerator as jest.Mock).mockReturnValue("verylongname");
            const mockMath = Object.create(global.Math);
            mockMath.random = () => 0.5;
            global.Math = mockMath;

            const generatedName = NameGenerator.generateName();

            // Total length should not exceed 14 characters
            expect(generatedName.length).toBeLessThanOrEqual(14);
            expect(generatedName).toMatch(new RegExp(NameGenerator.PATTERN));
        });

        it("should use different dictionaries", () => {
            // Test multiple generations to ensure dictionary variation
            const mockMath = Object.create(global.Math);
            let currentIndex = 0;
            mockMath.random = () => {
                currentIndex = (currentIndex + 1) % 6;
                return currentIndex / 6;
            };
            global.Math = mockMath;

            // Generate multiple names to test dictionary variation
            const names = new Set();
            for (let i = 0; i < 6; i++) {
                (uniqueNamesGenerator as jest.Mock).mockReturnValue(`test${i}`);
                names.add(NameGenerator.generateName());
            }

            // Verify we got different names
            expect(names.size).toBeGreaterThan(1);
        });
    });

    describe("validateName", () => {
        it("should validate correct names", () => {
            const validNames = [
                "test123",
                "abc123",
                "name12345",
                "ABC123",
                "Mix123",
                "a1b2c3"
            ];

            validNames.forEach(name => {
                expect(NameGenerator.validateName(name)).toBe(true);
            });
        });

        it("should reject invalid names", () => {
            const invalidNames = [
                "", // empty string
                "ab", // too short
                "toolongusername123456", // too long
                "special@character", // special characters
                "space name", // spaces
                "under_score", // underscore
                null, // null
                undefined, // undefined
                "émoji😊" // emoji and non-ASCII
            ];

            invalidNames.forEach(name => {
                expect(NameGenerator.validateName(name as string)).toBe(false);
            });
        });

        it("should validate names at boundary conditions", () => {
            // Test minimum length (3 characters)
            expect(NameGenerator.validateName("a1b")).toBe(true);
            expect(NameGenerator.validateName("ab")).toBe(false);

            // Test maximum length (14 characters)
            expect(NameGenerator.validateName("abcd1234567890")).toBe(true); // exactly 14 chars
            expect(NameGenerator.validateName("abcd12345678901")).toBe(false); // 15 chars
        });
    });
}); 