/**
 * Production Circuit Breaker pattern for AI External Dependencies
 * Prevents cascading process failure and socket starvation during provider outages.
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || "AIProviderCircuitBreaker";
    this.failureThreshold = options.failureThreshold || 5; // failures before opening
    this.cooldownMs = options.cooldownMs || 15000; // 15s cooldown when OPEN
    this.requestTimeoutMs = options.requestTimeoutMs || 20000; // 20s timeout per call

    this.state = "CLOSED"; // CLOSED | OPEN | HALF-OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.lastStateChange = Date.now();
    this.lastFailureTime = null;
  }

  canExecute() {
    const now = Date.now();

    if (this.state === "OPEN") {
      if (now - this.lastStateChange >= this.cooldownMs) {
        this.transitionTo("HALF-OPEN");
        return true;
      }
      return false; // Reject execution immediately while OPEN
    }

    return true; // Allowed when CLOSED or HALF-OPEN
  }

  recordSuccess() {
    this.failureCount = 0;
    if (this.state === "HALF-OPEN") {
      this.successCount++;
      if (this.successCount >= 2) {
        this.transitionTo("CLOSED");
      }
    }
  }

  recordFailure(error) {
    this.lastFailureTime = Date.now();
    this.failureCount++;

    console.warn(`[CircuitBreaker:${this.name}] Failure recorded (${this.failureCount}/${this.failureThreshold}): ${error?.message || error}`);

    if (this.state === "CLOSED" && this.failureCount >= this.failureThreshold) {
      this.transitionTo("OPEN");
    } else if (this.state === "HALF-OPEN") {
      this.transitionTo("OPEN");
    }
  }

  transitionTo(newState) {
    console.log(`[CircuitBreaker:${this.name}] State transition: ${this.state} -> ${newState}`);
    this.state = newState;
    this.lastStateChange = Date.now();

    if (newState === "CLOSED") {
      this.failureCount = 0;
      this.successCount = 0;
    } else if (newState === "HALF-OPEN") {
      this.successCount = 0;
    }
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange,
      cooldownMs: this.cooldownMs,
    };
  }
}

export default new CircuitBreaker();
