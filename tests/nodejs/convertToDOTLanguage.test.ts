import { convertToDOTLanguage } from '../../AzViz/src/nodejs/convertToDOTLanguage';
import { convertFromARM } from '../../AzViz/src/nodejs/convertFromARM';
import { convertFromNetwork } from '../../AzViz/src/nodejs/convertFromNetwork';
import { getImageLabel } from '../../AzViz/src/nodejs/getImageLabel';
import { getImageNode } from '../../AzViz/src/nodejs/getImageNode';
import { removeSpecialChars } from '../../AzViz/src/nodejs/removeSpecialChars';
import { getDOTExecutable } from '../../AzViz/src/nodejs/getDOTExecutable';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

jest.mock('../../AzViz/src/nodejs/convertFromARM');
jest.mock('../../AzViz/src/nodejs/convertFromNetwork');
jest.mock('../../AzViz/src/nodejs/getImageLabel');
jest.mock('../../AzViz/src/nodejs/getImageNode');
jest.mock('../../AzViz/src/nodejs/removeSpecialChars');
jest.mock('../../AzViz/src/nodejs/getDOTExecutable');
jest.mock('child_process');
jest.mock('fs');
jest.mock('path');

describe('convertToDOTLanguage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should convert Azure resources to DOT language', async () => {
    const targets = ['test-rg'];
    const targetType = 'Azure Resource Group';
    const labelVerbosity = 1;
    const categoryDepth = 1;
    const direction = 'top-to-bottom';
    const splines = 'spline';
    const excludeTypes = [];

    (convertFromARM as jest.Mock).mockResolvedValue([
      {
        Type: 'Azure Resource Group',
        Name: 'test-rg',
        Resources: [
          {
            fromcateg: 'Microsoft.Network/publicIPAddresses',
            from: 'test-pip',
            to: '',
            tocateg: '',
            isdependent: false,
            rank: 1,
          },
        ],
      },
    ]);

    (convertFromNetwork as jest.Mock).mockResolvedValue([
      {
        Type: 'Azure Resource Group',
        Name: 'test-rg',
        Resources: [
          {
            fromcateg: 'Microsoft.Network/publicIPAddresses',
            from: 'test-pip',
            to: '',
            tocateg: '',
            association: '',
            rank: 1,
          },
        ],
      },
    ]);

    (getImageLabel as jest.Mock).mockReturnValue('label');
    (getImageNode as jest.Mock).mockReturnValue('node');
    (removeSpecialChars as jest.Mock).mockReturnValue('test-rg');
    (getDOTExecutable as jest.Mock).mockReturnValue('dot');

    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fs.unlink as jest.Mock).mockResolvedValue(undefined);

    (exec as jest.Mock).mockImplementation((cmd, callback) => {
      callback(null, '', '');
    });

    const result = await convertToDOTLanguage(
      targets,
      targetType,
      labelVerbosity,
      categoryDepth,
      direction,
      splines,
      excludeTypes
    );

    expect(result).toContain('strict digraph Visualization');
    expect(result).toContain('subgraph main');
    expect(result).toContain('subgraph test-rg1');
    expect(result).toContain('label=<<TABLE border="0" cellborder="0" cellpadding="0"><TR><TD ALIGN="center" colspan="2"><img src="icons/Subscriptions.png"/></TD></TR><TR><TD align="left">  Subscription: subscription</TD></TR><TR><TD align="left">  Id: id</TD></TR></TABLE>>');
  });

  it('should throw an error if GraphViz is not installed', async () => {
    const targets = ['test-rg'];
    const targetType = 'Azure Resource Group';
    const labelVerbosity = 1;
    const categoryDepth = 1;
    const direction = 'top-to-bottom';
    const splines = 'spline';
    const excludeTypes = [];

    (convertFromARM as jest.Mock).mockResolvedValue([]);
    (convertFromNetwork as jest.Mock).mockResolvedValue([]);
    (getDOTExecutable as jest.Mock).mockReturnValue(null);

    await expect(
      convertToDOTLanguage(
        targets,
        targetType,
        labelVerbosity,
        categoryDepth,
        direction,
        splines,
        excludeTypes
      )
    ).rejects.toThrow('GraphViz is not installed on this system. Please download and install from https://graphviz.org/download/ and re-run this command.');
  });
});
