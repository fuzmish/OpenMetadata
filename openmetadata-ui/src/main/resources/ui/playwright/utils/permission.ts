/*
 *  Copyright 2024 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import { expect, Page } from '@playwright/test';

export const checkNoPermissionPlaceholder = async (
  page: Page,
  label: string | RegExp,
  permission = false
) => {
  const placeholder = page
    .getByLabel(label)
    .locator('[data-testid="permission-error-placeholder"]');

  if (permission) {
    await expect(placeholder).not.toBeVisible();
  } else {
    await expect(placeholder).toBeVisible();
    await expect(placeholder).toContainText(
      'You don’t have access, please check with the admin to get permissions'
    );
  }
};

export const validateViewPermissions = async (
  page: Page,
  permission?: {
    viewSampleData?: boolean;
    viewQueries?: boolean;
    viewTests?: boolean;
    editDisplayName?: boolean;
  }
) => {
  // check Add domain permission
  await expect(page.locator('[data-testid="add-domain"]')).not.toBeVisible();

  await expect(
    page.locator('[data-testid="edit-displayName-button"]')
  ).toHaveCount(permission?.editDisplayName ? 6 : 0);

  // check edit owner permission
  await expect(page.locator('[data-testid="edit-owner"]')).not.toBeVisible();
  // check edit description permission
  await expect(
    page.locator('[data-testid="edit-description"]')
  ).not.toBeVisible();
  // check edit tier permission
  await expect(page.locator('[data-testid="edit-tier"]')).not.toBeVisible();

  // check add tags button
  await expect(
    page.locator(
      '[data-testid="tags-container"] > [data-testid="entity-tags"] .ant-tag'
    )
  ).not.toBeVisible();
  // check add glossary term button
  await expect(
    page.locator(
      '[data-testid="glossary-container"] > [data-testid="entity-tags"] .ant-tag'
    )
  ).not.toBeVisible();

  // check manage button
  await expect(page.locator('[data-testid="manage-button"]')).toHaveCount(
    permission?.editDisplayName ? 1 : 0
  );

  if (permission?.editDisplayName) {
    await page.click('[data-testid="manage-button"]');
    await page.click('[data-testid="rename-button"]');
    await page.fill('#displayName', 'updated-table-name');
    const updateDisplayNameResponse = page.waitForResponse(
      (response) =>
        response.url().includes('api/v1/tables/') && response.status() === 200
    );
    await page.click('[data-testid="save-button"]');

    await updateDisplayNameResponse;

    await expect(
      page.locator('[data-testid="entity-header-display-name"]')
    ).toContainText('updated-table-name');
  }

  await page.click('[data-testid="sample_data"]');
  await page.waitForLoadState('domcontentloaded');
  await checkNoPermissionPlaceholder(
    page,
    /Sample Data/,
    permission?.viewSampleData
  );
  await page.click('[data-testid="table_queries"]');
  await page.waitForLoadState('domcontentloaded');
  await checkNoPermissionPlaceholder(page, /Queries/, permission?.viewQueries);
  await page.click('[data-testid="profiler"]');
  await page.waitForLoadState('domcontentloaded');
  await checkNoPermissionPlaceholder(
    page,
    /Profiler & Data Quality/,
    permission?.viewTests
  );
  await page.click('[data-testid="lineage"]');
  await page.waitForLoadState('domcontentloaded');

  await expect(page.locator('[data-testid="edit-lineage"]')).toBeDisabled();

  await page.click('[data-testid="custom_properties"]');
  await page.waitForLoadState('domcontentloaded');
  await checkNoPermissionPlaceholder(page, /Custom Properties/);
};
