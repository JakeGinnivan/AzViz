import { writeCustomHost } from '../../AzViz/src/nodejs/writeCustomHost';

describe('writeCustomHost', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should write a custom host message with default parameters', () => {
    writeCustomHost('Test message');
    expect(consoleSpy).toHaveBeenCalledWith('%c   ▶ Test message', 'color: white');
  });

  it('should write a custom host message with custom start character and indentation', () => {
    writeCustomHost('Test message', '*', 2);
    expect(consoleSpy).toHaveBeenCalledWith('%c      * Test message', 'color: white');
  });

  it('should write a custom host message with custom color', () => {
    writeCustomHost('Test message', '▶', 1, 'red');
    expect(consoleSpy).toHaveBeenCalledWith('%c   ▶ Test message', 'color: red');
  });

  it('should write a custom host message with time', () => {
    jest.useFakeTimers();
    const startTime = new Date();
    jest.setSystemTime(startTime.getTime() + 5000);
    writeCustomHost('Test message', '▶', 1, 'white', true);
    expect(consoleSpy).toHaveBeenCalledWith('%c   ▶ Test message 5.00s', 'color: white');
    jest.useRealTimers();
  });
});
