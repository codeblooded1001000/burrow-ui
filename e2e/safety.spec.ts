import { expect, test } from '@playwright/test';

const mockViewer = {
  id: 'u-viewer',
  email: 'viewer@example.com',
  role: 'SEEKER' as const,
  companyName: 'Acme',
  companyVerified: true,
  hasProfile: true,
  hasListing: false,
  profileCompletion: 100,
  createdAt: '2026-01-01T00:00:00.000Z',
  fullName: 'Viewer User',
  photoUrl: null as string | null,
};

async function mockAuthShell(page: import('@playwright/test').Page) {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: mockViewer }),
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

const mockListing = {
  id: 'list-1',
  userId: 'u-lister',
  localityName: 'Indiranagar',
  lat: 12.97,
  lng: 77.64,
  bhk: 2,
  totalRent: 40000,
  yourShare: 20000,
  availableFrom: '2026-06-01T00:00:00.000Z',
  photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'],
  description: 'Bright flat near the park.',
  amenities: ['WiFi'],
  preferredGender: 'ANYONE' as const,
  preferredProfessions: [] as string[],
  smokingAllowed: false,
  foodPref: null,
  workSchedulePref: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  lister: {
    id: 'u-lister',
    fullName: 'Alex Lister',
    age: 28,
    gender: 'MAN' as const,
    photoUrl: null,
    profession: 'Engineer',
    companyName: 'Acme',
    companyVerified: true,
  },
};

const mockProfilePublic = {
  id: 'prof-victim',
  userId: 'u-victim',
  fullName: 'Jamie Reported',
  age: 27,
  gender: 'WOMAN' as const,
  photoUrl: null,
  bio: 'Seeker',
  profession: 'Designer',
  workSchedule: 'OFFICE' as const,
  budgetMin: 15000,
  budgetMax: 25000,
  moveInDate: '2026-07-01T00:00:00.000Z',
  preferredLocalities: ['Indiranagar'],
  lifestyleTags: [] as string[],
  smokingPref: 'NON_SMOKER' as const,
  foodPref: null,
  user: { id: 'u-victim', companyName: 'Acme', companyVerified: true },
};

test.describe('safety (mocked API)', () => {
  test('listing detail block flow sends POST /blocks after confirmation', async ({ page }) => {
    await mockAuthShell(page);
    await page.route('**/api/v1/listings/list-1', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockListing) });
    });
    await page.route('**/api/v1/conversations/lookup?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ conversationId: null }),
      });
    });

    let blockPosts = 0;
    await page.route('**/api/v1/blocks', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      blockPosts += 1;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ block: { id: 'b1', blockedUserId: 'u-lister', createdAt: '2026-01-01T00:00:00.000Z' } }),
      });
    });

    await page.goto('/listings/list-1');
    await expect(page.getByRole('heading', { name: /BHK in Indiranagar/i })).toBeVisible({ timeout: 25_000 });

    await page.getByRole('button', { name: 'More actions' }).click();
    await page.getByRole('button', { name: 'Block' }).click();

    const blockDialogBtn = page.getByRole('dialog').getByRole('button', { name: 'Block', exact: true });
    await expect(blockDialogBtn).toBeDisabled();
    await page.getByRole('checkbox').click();
    await expect(blockDialogBtn).toBeEnabled();
    await blockDialogBtn.click();
    expect(blockPosts).toBe(1);
  });

  test('report flow submits and lands on submitted screen', async ({ page }) => {
    await mockAuthShell(page);
    await page.route('**/api/v1/profiles/u-victim', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProfilePublic) });
    });

    let reportPosts = 0;
    await page.route('**/api/v1/reports', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      reportPosts += 1;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          report: {
            id: 'r1',
            reportedUser: { id: 'u-victim', fullName: 'Jamie Reported', companyName: 'Acme' },
            category: 'HARASSMENT',
            status: 'PENDING',
            createdAt: '2026-01-01T00:00:00.000Z',
            resolvedAt: null,
          },
          autoBlocked: true,
        }),
      });
    });

    await page.goto('/report/u-victim');
    await expect(page.getByRole('heading', { name: 'Report this user' })).toBeVisible({ timeout: 25_000 });
    await page.getByText('Harassment', { exact: true }).click();
    await page.getByRole('button', { name: 'Submit report' }).click();
    await expect(page.getByRole('heading', { name: 'Report submitted' })).toBeVisible({ timeout: 15_000 });
    expect(reportPosts).toBe(1);
  });

  test('unblock sends DELETE /blocks/:userId', async ({ page }) => {
    await mockAuthShell(page);
    await page.route('**/api/v1/blocks', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'row-1',
              blockedUser: { id: 'u-x', fullName: 'Blocked Person', photoUrl: null, companyName: 'Acme' },
              createdAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        }),
      });
    });

    let deletes = 0;
    await page.route('**/api/v1/blocks/u-x', async (route) => {
      if (route.request().method() !== 'DELETE') {
        await route.continue();
        return;
      }
      deletes += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, wasBlocking: true }) });
    });

    await page.goto('/blocked-users');
    await expect(page.getByText('Blocked Person')).toBeVisible({ timeout: 25_000 });
    await page.getByRole('button', { name: 'Unblock' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Unblock', exact: true }).click();
    expect(deletes).toBe(1);
  });

  test('delete account calls DELETE /users/me with PIN body', async ({ page }) => {
    await mockAuthShell(page);

    let delBody: unknown;
    await page.route('**/api/v1/users/me', async (route) => {
      if (route.request().method() !== 'DELETE') {
        await route.continue();
        return;
      }
      delBody = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });

    await page.goto('/settings/delete-account');
    await expect(page.getByText(/This will delete your Burrow account/i)).toBeVisible({ timeout: 25_000 });

    const pin = '123456';
    for (let i = 0; i < 6; i += 1) {
      await page.getByLabel(`PIN digit ${i + 1} of 6`).fill(pin[i] ?? '');
    }

    await page.getByRole('button', { name: 'Delete permanently' }).click();
    expect(delBody).toEqual({ pin: '123456' });
    await expect(page.getByRole('heading', { name: 'Account scheduled for deletion' })).toBeVisible({ timeout: 10_000 });
  });
});
