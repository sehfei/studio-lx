import { NextResponse } from "next/server";

// API 统一响应格式：
// 成功 -> { data: ... }
// 失败 -> { error: { code, message } }

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export const unauthorized = () =>
  fail(401, "unauthorized", "需要管理员登录");

export const notFound = (message = "资源不存在") =>
  fail(404, "not_found", message);

export const badRequest = (message: string) =>
  fail(400, "bad_request", message);

export const serverError = (message = "服务器内部错误") =>
  fail(500, "internal_error", message);

export const tooManyRequests = (message = "请求过于频繁，请稍后再试") =>
  fail(429, "rate_limited", message);
