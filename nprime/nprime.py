# Python code to compute Nth prime
import sys, math

# Return the Nth prime
# Example usage: 
#    n = 100
#    print(f"The {n}th prime number is: {nth_prime(n)}")
def nth_prime(n): 
    if n < 1:
        raise ValueError("n must be a positive integer")  
    if n < 6: 
        limit = 15  # Small limit for small n 
    else: 
        limit = int(n * (math.log(n) + math.log(math.log(n)))) + 1  # Approximate upper bound 

    # Use the Sieve of Eratosthenes to find all primes up to "limit"
    sieve = [True] * (limit + 1) 
    sieve[0] = sieve[1] = False  # 0 and 1 are not primes 
 
    for start in range(2, int(math.sqrt(limit) + 1)): 
        if sieve[start]: 
            for multiple in range(start*start, limit + 1, start): 
                sieve[multiple] = False 
 
    primes = [num for num, is_prime in enumerate(sieve) if is_prime] 
 
    if n <= len(primes): 
        return primes[n - 1] 
    else: 
        raise ValueError("Limit exceeded. Increase the limit.") 

def main():
    if len(sys.argv) < 2:
        raise IndexError("Missing command line argument for N")
    arg = sys.argv[1]
    if arg.isdigit():
        n = int(arg)
        print(f"The {n}th prime number is: {nth_prime(n)}")
    else: 
        raise TypeError("Command line argument is not a number")

if __name__ == "__main__":
    main()