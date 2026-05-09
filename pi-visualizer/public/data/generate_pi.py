import sys

def generate_pi_chudnovsky(digits):
    """
    Compute Pi to 'digits' decimal places using Chudnovsky algorithm.
    """
    C = 426880 * 10005 ** 0.5
    K = 6.0
    M = 1.0
    X = 1.0
    L = 13591409.0
    S = L

    # We need to compute to higher precision, so we use integers and scale.
    # Actually, Python's decimal module is better suited for this.
    import decimal
    decimal.getcontext().prec = digits + 10

    C = decimal.Decimal(426880) * decimal.Decimal(10005).sqrt()
    K = decimal.Decimal(6)
    M = decimal.Decimal(1)
    X = decimal.Decimal(1)
    L = decimal.Decimal(13591409)
    S = decimal.Decimal(13591409)

    for i in range(1, digits // 14 + 2):
        M = M * (K**3 - 16*K) / decimal.Decimal(i**3)
        L += 545140134
        X *= -262537412640768000
        S += decimal.Decimal(M * L) / X
        K += 12

    pi = C / S
    # return string with '3.' removed, or just raw digits
    return str(pi)[:digits+2]

if __name__ == '__main__':
    digits = 10000000
    print(f"Generating {digits} digits of Pi...")
    pi_str = generate_pi_chudnovsky(digits)
    with open('pi-10m.txt', 'w') as f:
        f.write(pi_str)
    print("Done")
