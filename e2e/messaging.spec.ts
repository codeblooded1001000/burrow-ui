import { expect, test } from '@playwright/test';

const mockUser = {
  id: 'u-test',
  email: 'test@example.com',
  role: 'SEEKER' as const,
  companyName: 'Acme',
  companyVerified: true,
  hasProfile: true,
  hasListing: false,
  profileCompletion: 100,
  createdAt: '2026-01-01T00:00:00.000Z',
  fullName: 'Test User',
  photoUrl: null as string | null,
};

async function mockAuthAndUnread(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: mockUser }),
    });
  });
  await page.route('**/api/v1/messages/unread-count', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0 }),
    });
  });
}

test.describe('messaging (mocked API)', () => {
  test('inbox shows empty state when there are no conversations', async ({ page }) => {
    await mockAuthAndUnread(page);
    await page.route('**/api/v1/conversations?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], nextCursor: null, hasMore: false }),
      });
    });

    await page.goto('/inbox');
    await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();
    await expect(page.getByText('No conversations yet')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse listings' })).toBeVisible();
  });

  test('optimistic send shows retry after POST 500', async ({ page }) => {
    await mockAuthAndUnread(page);
    await page.route('**/api/v1/conversations?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], nextCursor: null, hasMore: false }),
      });
    });

    const summary = {
      id: 'c1',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastMessageAt: '2026-05-02T10:00:00.000Z',
      numbersShared: false,
      otherParticipant: {
        id: 'u-other',
        fullName: 'Alex',
        photoUrl: null,
        companyName: 'Co',
        companyVerified: true,
      },
      lastMessage: {
        id: 'm0',
        conversationId: 'c1',
        senderId: 'u-other',
        body: 'Hi',
        createdAt: '2026-05-02T10:00:00.000Z',
        readAt: null,
      },
      unreadCount: 0,
    };

    await page.route('**/api/v1/conversations/c1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(summary),
      });
    });

    await page.route('**/api/v1/conversations/c1/messages?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'm0',
              conversationId: 'c1',
              senderId: 'u-other',
              body: 'Hi',
              createdAt: '2026-05-02T10:00:00.000Z',
              readAt: null,
            },
          ],
          nextCursor: null,
          hasMore: false,
        }),
      });
    });

    let posts = 0;
    await page.route('**/api/v1/conversations/c1/messages', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      posts += 1;
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'INTERNAL', message: 'fail' } }),
      });
    });

    await page.goto('/inbox/c1');
    await expect(page.getByPlaceholder('Message')).toBeVisible();
    await page.getByPlaceholder('Message').fill('Hello fail');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('Tap to retry')).toBeVisible({ timeout: 10_000 });
    expect(posts).toBe(1);
  });
});
