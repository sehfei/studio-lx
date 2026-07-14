import { describe, expect, it } from "vitest";
import { reviewAggregate, type Review } from "@/lib/reviews";

function review(rating: number): Review {
  return {
    id: crypto.randomUUID(),
    rating,
    comment: "",
    authorName: "Tester",
    createdAt: new Date().toISOString(),
  };
}

describe("reviewAggregate", () => {
  it("空数组返回 average 0 count 0", () => {
    expect(reviewAggregate([])).toEqual({ average: 0, count: 0 });
  });

  it("计算平均分和数量", () => {
    const reviews = [review(5), review(3), review(4)];
    expect(reviewAggregate(reviews)).toEqual({ average: 4, count: 3 });
  });

  it("单条评价平均分等于自身评分", () => {
    expect(reviewAggregate([review(2)])).toEqual({ average: 2, count: 1 });
  });
});
