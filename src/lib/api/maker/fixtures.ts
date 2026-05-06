import { axiosClient } from "@/lib/api/axiosClient";

export interface CreateFixturePayload {
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

export interface FixtureResponse {
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

function normalizeFixture(fixture: FixtureResponse): FixtureResponse {
  return {
    ...fixture,
    code: fixture.code ?? "",
    planogram_id:
      fixture.current_planogram_assignment?.planogram_id ??
      fixture.planogram_id ??
      null,
  };
}

export function fetchStoreFixtures(): Promise<FixtureResponse[]> {
  return axiosClient
    .get<FixtureResponse[]>("/fixtures")
    .then((res) => res.data.map(normalizeFixture));
}

export function fetchReadyForAnalysisFixtures(): Promise<FixtureResponse[]> {
  return axiosClient
    .get<FixtureResponse[]>("/fixtures/ready-for-analysis")
    .then((res) => res.data.map(normalizeFixture));
}

export function createFixture(
  payload: CreateFixturePayload,
): Promise<FixtureResponse> {
  return axiosClient
    .post<FixtureResponse>("/fixtures", payload)
    .then((res) => normalizeFixture(res.data));
}
