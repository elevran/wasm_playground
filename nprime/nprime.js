// Javascript program to the nth prime number

function nthprime(nth) {
    switch (true) {
        case nth < 0:
            throw new Error('Prime is not possible')
        case nth === 0:
            throw new Error('there is no zeroth prime')
    }
    const max = nth > 6 ? maxNthPrime(nth) : 15
    return sieve(max)[nth - 1]
}

function maxNthPrime(n) {
    return Math.ceil(n * (Math.log(n) + Math.log(Math.log(n)))) // approximate upper bound
}

function sieve(limit) {
    // Use the Sieve of Eratosthenes to find all primes up to "limit"
    const primes = Array(limit + 1).fill(true)
    primes[0] = primes[1] = false
    for (let i = 2; i < Math.sqrt(limit); i++) {
        for (let j = i * i; primes[i] && j < limit; j += i) {
            primes[j] = false
        }
    }
    return primes.map((b, i) => b ? i : b)
        .filter(i => i)
}

// QuickJS workarounds
// no access to process.args for command line arguments
function getCommandLineArgs() {
    if (typeof process !== 'undefined' && process.argv) {
      return process.argv.slice(2);
    } else if (typeof globalThis !== 'undefined' && globalThis.qjs_argv) {
      return globalThis.qjs_argv.slice(2);
    }
    if (scriptArgs.length > 1) {
        return [scriptArgs[1]];
    }
    return [];
}

// no console.error function
const console = {
    error: function(...args) {
      print('Error:', ...args);
    },
    log: function(...args) {
        print(...args);
    }
};

export function main() {
    const args = getCommandLineArgs();
    if (args.length === 0) {
      console.error("Usage: <js-runtime> nprime.js <integer>");
      return 1;
    }
  
    const num = parseInt(args[0], 10);
    if (isNaN(num)) {
      console.error("Error: Argument is not a valid integer.");
      return 1;
    }
  
    console.log(`The ${num}th prime number is ${nthprime(num)}`);
  }
  
 main();
