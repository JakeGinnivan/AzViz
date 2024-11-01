import { getDOTExecutable } from '../../AzViz/src/nodejs/getDOTExecutable';
import { execSync } from 'child_process';

jest.mock('child_process');

describe('getDOTExecutable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the path to the GraphViz executable if found', () => {
    (execSync as jest.Mock).mockReturnValue('/usr/local/bin/dot');

    const result = getDOTExecutable();

    expect(result).toBe('/usr/local/bin/dot');
  });

  it('should return null if the GraphViz executable is not found', () => {
    (execSync as jest.Mock).mockImplementation(() => {
      throw new Error('not found');
    });

    const result = getDOTExecutable();

    expect(result).toBeNull();
  });

  it('should check multiple possible paths for the GraphViz executable', () => {
    (execSync as jest.Mock).mockReturnValueOnce('').mockReturnValueOnce('/usr/local/bin/dot');

    const result = getDOTExecutable();

    expect(execSync).toHaveBeenCalledTimes(2);
    expect(result).toBe('/usr/local/bin/dot');
  });
});
