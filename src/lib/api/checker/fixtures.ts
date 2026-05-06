import { axiosClient } from "@/lib/api/axiosClient";

export interface StoreFixtureApiModel {
  id: string;
  store_id: string;
  type: string;
  code: string;
  compliance_rule_set_id?: string | null;
  planogram_id?: string | null;
  current_planogram_assignment?: FixtureCurrentPlanogramAssignmentApiModel | null;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  dimension_unit: string;
  physical_location: {
    section: string;
    aisle: string;
    zone: string;
  };
  created_at: string;
  updated_at: string;
}

export interface FixtureCurrentPlanogramAssignmentApiModel {
  assignment_id: string;
  planogram_id: string | null;
  planogram_name: string | null;
  planogram_status: string | null;
  assigned_at: string;
  assigned_by: string | null;
}

export interface FixturePlanogramAssignmentHistoryApiModel {
  id: string;
  fixture_id: string;
  planogram_id: string | null;
  planogram_name: string | null;
  planogram_status: string | null;
  assigned_at: string;
  assigned_by: string | null;
  cleared_at: string | null;
  cleared_by: string | null;
  is_current: boolean;
}

export interface CreateStoreFixturePayload {
  type: string;
  code: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  dimension_unit: string;
  physical_location: {
    section: string;
    aisle: string;
    zone: string;
  };
}

export interface CreateStoreFixturesBulkPayload {
  fixtures: Array<{
    code: string;
    type: string;
    dimensions: {
      width: number;
      height: number;
      depth: number;
    };
    dimension_unit: string;
    physical_location: {
      section: string;
      aisle: string;
      zone: string;
    };
    shelves: Array<{
      code: string;
      name: string;
      width: number;
      height: number;
      vertical_position: number;
    }>;
  }>;
}

export interface CreateStoreFixturesBulkResponse {
  fixtures: Array<
    StoreFixtureApiModel & {
      shelves: Array<{
        id: string;
        code: string;
        name: string;
        width: number;
        height: number;
        vertical_position: number;
        created_at: string;
        updated_at: string;
      }>;
    }
  >;
}

export interface UpdateStoreFixturePayload {
  type?: string;
  code?: string;
  compliance_rule_set_id?: string | null;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  dimension_unit?: string;
  physical_location?: {
    section?: string;
    aisle?: string;
    zone?: string;
  };
}

interface AssignFixturePlanogramPayload {
  planogram_id: string;
}

function normalizeFixture(fixture: StoreFixtureApiModel): StoreFixtureApiModel {
  return {
    ...fixture,
    code: fixture.code ?? "",
    planogram_id:
      fixture.current_planogram_assignment?.planogram_id ??
      fixture.planogram_id ??
      null,
  };
}

export async function fetchStoreFixtures(): Promise<StoreFixtureApiModel[]> {
  const response = await axiosClient.get<StoreFixtureApiModel[]>("/fixtures");
  const fixtures = response.data;
  return fixtures.map(normalizeFixture);
}

export async function createStoreFixture(
  storeId: string,
  payload: CreateStoreFixturePayload,
): Promise<StoreFixtureApiModel> {
  const response = await axiosClient.post<StoreFixtureApiModel>(
    "/fixtures",
    payload,
    {
      headers: { "X-Store-Id": storeId },
    },
  );
  const fixture = response.data;
  return normalizeFixture(fixture);
}

export async function createStoreFixturesBulk(
  storeId: string,
  payload: CreateStoreFixturesBulkPayload,
): Promise<CreateStoreFixturesBulkResponse> {
  const response = await axiosClient.post<CreateStoreFixturesBulkResponse>(
    "/fixtures/bulk",
    payload,
    {
      headers: { "X-Store-Id": storeId },
    },
  );
  return response.data;
}

export async function updateStoreFixture(
  storeId: string,
  fixtureId: string,
  payload: UpdateStoreFixturePayload,
): Promise<StoreFixtureApiModel> {
  const response = await axiosClient.put<StoreFixtureApiModel>(
    `/fixtures/${fixtureId}`,
    payload,
    {
      headers: { "X-Store-Id": storeId },
    },
  );
  const fixture = response.data;
  return normalizeFixture(fixture);
}

export async function deleteStoreFixture(
  storeId: string,
  fixtureId: string,
): Promise<void> {
  await axiosClient.delete(`/fixtures/${fixtureId}`, {
    headers: { "X-Store-Id": storeId },
  });
}

export async function assignPlanogramToFixture(
  storeId: string,
  fixtureId: string,
  planogramId: string,
): Promise<FixtureCurrentPlanogramAssignmentApiModel> {
  const response =
    await axiosClient.post<FixtureCurrentPlanogramAssignmentApiModel>(
      `/fixtures/${fixtureId}/planogram-assignment`,
      { planogram_id: planogramId } satisfies AssignFixturePlanogramPayload,
      {
        headers: { "X-Store-Id": storeId },
      },
    );
  return response.data;
}

export async function clearPlanogramFromFixture(
  storeId: string,
  fixtureId: string,
): Promise<void> {
  await axiosClient.delete(`/fixtures/${fixtureId}/planogram-assignment`, {
    headers: { "X-Store-Id": storeId },
  });
}

export async function fetchFixturePlanogramAssignmentHistory(
  storeId: string,
  fixtureId: string,
): Promise<FixturePlanogramAssignmentHistoryApiModel[]> {
  const response = await axiosClient.get<
    FixturePlanogramAssignmentHistoryApiModel[]
  >(`/fixtures/${fixtureId}/planogram-assignments`, {
    headers: { "X-Store-Id": storeId },
  });
  return response.data;
}
