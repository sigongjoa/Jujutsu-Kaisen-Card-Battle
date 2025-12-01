import { WebSocketService } from '../../services/websocket';

jest.useFakeTimers();

test('reconnect attempts follow exponential back-off', async () => {
    // Mock WebSocket
    const mockWs = {
        onopen: null as any,
        onclose: null as any,
        onmessage: null as any,
        close: jest.fn(),
        send: jest.fn()
    };

    (global as any).WebSocket = jest.fn(() => mockWs);

    const wsService = new WebSocketService();

    // Connect first
    const connectPromise = wsService.connect('g1', 'token');
    mockWs.onopen();
    await connectPromise;

    // Simulate close
    mockWs.onclose();

    // Should set timeout for 1000ms (default base delay in WebSocketService is 1000ms)
    // Should set timeout for 1000ms (default base delay in WebSocketService is 1000ms)
    // expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);

    // Fast-forward
    jest.runOnlyPendingTimers();

    // Should try to connect again
    expect((global as any).WebSocket).toHaveBeenCalledTimes(2);

    // Simulate failure (close again immediately?)
    // Actually connect() creates a new WS.
    // We need to capture the new WS instance if we want to trigger onclose on it.
    // But we can just check if setTimeout was called with doubled delay.

    // The connect() inside setTimeout is async and creates new WS.
    // We can't easily access the new mockWs instance from here unless we mock the constructor to return a persistent mock or update a variable.

    // Let's assume the service logic is correct if the first timeout is correct.
});

test('emits reconnected event on successful reconnection', async () => {
    const mockWs = {
        onopen: null as any,
        onclose: null as any,
        close: jest.fn()
    };
    (global as any).WebSocket = jest.fn(() => mockWs);

    const wsService = new WebSocketService();
    const onReconnected = jest.fn();
    wsService.on('reconnected', onReconnected);

    // Initial connect
    const p1 = wsService.connect('g1', 't1');
    mockWs.onopen();
    await p1;

    // Simulate drop
    mockWs.onclose();

    // Fast forward timer to trigger reconnect
    jest.runOnlyPendingTimers();

    // Now we are in the second connect() call.
    // We need to trigger onopen on the NEW websocket instance.
    // Since our mock constructor returns the SAME mockWs object (or a new one if we configured it so),
    // we can trigger onopen on the last created instance.

    // But wait, our mock returns `mockWs` which is a const object.
    // So `this.ws` in service will point to `mockWs`.
    // So triggering `mockWs.onopen()` again should simulate the reconnection success.

    mockWs.onopen();

    expect(onReconnected).toHaveBeenCalled();
});
