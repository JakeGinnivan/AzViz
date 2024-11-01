function removeSpecialChars(str: string, specialChars: string = "()[]{}&."): string {
  const regex = new RegExp(`[${specialChars.split('').map(char => `\\${char}`).join('')}]`, 'g');
  return str.replace(regex, '');
}

export { removeSpecialChars };
