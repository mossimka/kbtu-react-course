export async function request<T>(operation: () => T): Promise<T> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 500 + Math.random() * 900));
    if (Math.random() < 0.08) {
        throw new Error('The simulated API is temporarily unavailable. Please try again.');
    }
    return operation();
}
