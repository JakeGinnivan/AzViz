import { removeSpecialChars } from '../../AzViz/src/nodejs/removeSpecialChars';

describe('removeSpecialChars', () => {
  it('should remove default special characters from a string', () => {
    const input = 'Hello (World) [Test] {Example} &String.';
    const expectedOutput = 'Hello World Test Example String';
    expect(removeSpecialChars(input)).toBe(expectedOutput);
  });

  it('should remove custom special characters from a string', () => {
    const input = 'Hello-World_Test=Example+String';
    const specialChars = '-_=+';
    const expectedOutput = 'HelloWorldTestExampleString';
    expect(removeSpecialChars(input, specialChars)).toBe(expectedOutput);
  });

  it('should return the original string if no special characters are found', () => {
    const input = 'Hello World Test Example String';
    const expectedOutput = 'Hello World Test Example String';
    expect(removeSpecialChars(input)).toBe(expectedOutput);
  });

  it('should handle an empty string', () => {
    const input = '';
    const expectedOutput = '';
    expect(removeSpecialChars(input)).toBe(expectedOutput);
  });

  it('should handle a string with only special characters', () => {
    const input = '()[]{}&.';
    const expectedOutput = '';
    expect(removeSpecialChars(input)).toBe(expectedOutput);
  });
});
