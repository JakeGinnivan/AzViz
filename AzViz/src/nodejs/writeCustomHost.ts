import { Console } from "console";

function writeCustomHost(
  message: string,
  startChar: string = "▶",
  indentation: number = 1,
  color: string = "white",
  addTime: boolean = false
): void {
  const spaces = "   ";
  const indent = spaces.repeat(indentation);
  const startTime = new Date();
  const timeDelta = new Date().getTime() - startTime.getTime();

  let duration = "";
  if (timeDelta >= 60000) {
    duration = `${Math.floor(timeDelta / 60000)}m ${Math.floor(
      (timeDelta % 60000) / 1000
    )}s`;
  } else if (timeDelta >= 1000) {
    duration = `${(timeDelta / 1000).toFixed(2)}s`;
  } else {
    duration = `${timeDelta}ms`;
  }

  const consoleMessage = `${indent}${startChar} ${message}`;
  if (addTime) {
    console.log(`%c${consoleMessage} ${duration}`, `color: ${color}`);
  } else {
    console.log(`%c${consoleMessage}`, `color: ${color}`);
  }
}

export { writeCustomHost };
