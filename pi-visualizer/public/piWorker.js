// Worker for generating Pi digits using Spigot/Chudnovsky or similar.
// For browser performance, a simple spigot algorithm (Rabinowitz-Wagon) or scaling is best.
// This is a basic implementation of the spigot algorithm for Pi.

self.onmessage = (e) => {
  const { action, digits } = e.data;

  if (action === 'generate') {
    // Generate 'digits' number of digits of pi
    // Since JS numbers are double precision floats, large integer arithmetic is needed.
    // We will use BigInt for precision.

    // Spigot algorithm for Pi using BigInt
    // Pi = sum(i=0 to infinity) ( (2^i * i!^2) / (2i + 1)! )

    // An alternative simpler one using BigInt (Gibbons spigot):
    let q = 1n;
    let r = 0n;
    let t = 1n;
    let k = 1n;
    let n = 3n;
    let l = 3n;

    let generated = "";
    let count = 0;

    // We generate digits one by one
    while (count < digits) {
      if (4n * q + r - t < n * t) {
        generated += n.toString();
        count++;

        // Report back in chunks so the UI doesn't completely freeze
        if (count % 100 === 0 || count === digits) {
          self.postMessage({ type: 'progress', data: generated });
        }

        let nr = 10n * (r - n * t);
        n = ((10n * (3n * q + r)) / t) - 10n * n;
        q *= 10n;
        r = nr;
      } else {
        let nr = (2n * q + r) * l;
        let nn = (q * (7n * k) + 2n + r * l) / (t * l);
        q *= k;
        t *= l;
        l += 2n;
        k += 1n;
        n = nn;
        r = nr;
      }
    }

    self.postMessage({ type: 'done', data: generated });
  }
};
