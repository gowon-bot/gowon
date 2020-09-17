const functions = {
  header: (text: string) => `${text}`,
};

function testing(functionName: string): boolean {
  if (functionName in functions) {
    return true;
  } else return false;
}

console.log(testing("header"));
console.log(testing("__proto__"));
