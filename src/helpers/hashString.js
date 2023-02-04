// returns hash value of a string, although numeric, returned as a string
// @see Java's hashCode() as this code uses the same hashing algorithm
export default function hashString(s) {
  return String(s).split('').reduce(function(a, b) {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0).toString();
}