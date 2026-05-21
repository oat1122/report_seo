import { NextResponse } from "next/server";
import { buildPageInfo, type PageInfo, type PageMeta } from "@/lib/pagination";

export type ApiSuccess<T> = { data: T };
export type ApiPaginated<T> = { data: T[]; pagination: PageInfo };

export function ok<T>(data: T, init?: ResponseInit): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data }, init);
}

export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data }, { status: 201 });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function okPaginated<T>(
  data: T[],
  meta: PageMeta,
): NextResponse<ApiPaginated<T>> {
  return NextResponse.json({ data, pagination: buildPageInfo(meta) });
}
