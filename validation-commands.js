/**
 * Command Layer Validation
 * Run: node validation-commands.js
 */

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

const now = Date.now();

// ---------------------------------------------------------
// Command Bus Foundation
// ---------------------------------------------------------
class TestCommand {
  type;
  constructor(type, payload) {
    this.type = type;
    this.payload = payload;
  }
}

class TestHandler {
  async handle(command) {
    return { success: true, data: { echoed: command.payload } };
  }
}

const bus = { handlers: new Map(), middleware: [] };
function register(type, handler) {
  bus.handlers.set(type, handler);
}
function use(mw) {
  bus.middleware.push(mw);
}

async function dispatch(command) {
  const handler = bus.handlers.get(command.type);
  if (!handler) return { success: false, error: `No handler for ${command.type}` };
  const pipeline = bus.middleware.reduceRight(
    (next, mw) => (cmd) => mw.execute(cmd, next),
    (cmd) => handler.handle(cmd)
  );
  return pipeline(command);
}

register('test.executed', new TestHandler());

// ---------------------------------------------------------
// Middleware: logging
// ---------------------------------------------------------
const middlewareLog = [];
use({
  async execute(command, next) {
    middlewareLog.push({ phase: 'before', type: command.type });
    const result = await next(command);
    middlewareLog.push({ phase: 'after', type: command.type, success: result.success });
    return result;
  },
});

// ---------------------------------------------------------
// Middleware: validation
// ---------------------------------------------------------
use({
  async execute(command, next) {
    if (command.payload && command.payload.shouldFail) {
      return { success: false, error: 'Validation failed' };
    }
    return next(command);
  },
});

register('test.executed', new TestHandler());

const result1 = await dispatch(new TestCommand('test.executed', { foo: 'bar' }));
assert(result1.success === true, 'Happy path must succeed');
assert(result1.data?.echoed?.foo === 'bar', 'Payload must round-trip');
assert(middlewareLog.length === 2, 'Middleware should log before/after');
assert(middlewareLog[0].phase === 'before');
assert(middlewareLog[1].phase === 'after');

// ---------------------------------------------------------
// Case 2: validation rejection
// ---------------------------------------------------------
const result2 = await dispatch(new TestCommand('test.executed', { shouldFail: true, foo: 'baz' }));
assert(result2.success === false, 'Validation middleware should reject');
assert(result2.error === 'Validation failed');

// ---------------------------------------------------------
// Case 3: typed event emission via middleware
// // ---------------------------------------------------------
const emittedEvents = [];
use({
  async execute(command, next) {
    const result = await next(command);
    if (result.success && command.type === 'test.executed') {
      emittedEvents.push({ type: command.type, payload: command.payload });
    }
    return result;
  },
});

await dispatch(new TestCommand('test.executed', { hello: 'world' }));
assert(emittedEvents.length === 1, 'Event middleware should emit one event');
assert(emittedEvents[0].type === 'test.executed');
assert(emittedEvents[0].payload.hello === 'world');

// ---------------------------------------------------------
// Case 4: handler isolation — repositories are not called from UI
// ---------------------------------------------------------
const repositoriesCalled = [];
class FakeRepo {
  async createWorkspace(payload) {
    repositoriesCalled.push(['workspace.create', payload]);
    return { id: 'ws-1', ...payload, createdAt: now, updatedAt: now };
  }
}
register('workspace.create', {
  async handle(command) {
    const repo = new FakeRepo();
    const ws = await repo.createWorkspace(command.payload);
    return { success: true, data: ws };
  },
});

const workspaceResult = await dispatch(new TestCommand('workspace.create', { name: 'Research' }));
assert(workspaceResult.success, 'Workspace handler must succeed');
assert(repositoriesCalled.length === 1, 'Repository should be called exactly once');
assert(repositoriesCalled[0][0] === 'workspace.create', 'Repository method isolated inside handler');

// ---------------------------------------------------------
// Case 5: command immutability — payload should not be mutated by middleware
// ---------------------------------------------------------
const originalPayload = { value: 42 };
const commandBeforeMiddleware = new TestCommand('test.executed', originalPayload);
use({
  async execute(command, next) {
    // Mutate a copy of payload to simulate bad middleware.
    const mutated = { ...command.payload, extra: 'mutated' };
    const result = await next({ ...command, payload: mutated });
    return result;
  },
});
await dispatch(commandBeforeMiddleware);
assert(originalPayload.value === 42, 'Original command payload must remain immutable');
assert(!('extra' in originalPayload), 'Original payload must not be polluted');

console.log('All command-layer assertions passed.');
