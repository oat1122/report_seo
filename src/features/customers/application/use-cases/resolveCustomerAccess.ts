import { CustomerAccessContext } from "../../domain/AccessContext";
import type { CustomerRepository } from "../ports/CustomerRepository";
import type { SessionGateway } from "../ports/SessionGateway";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";

export type CustomerAccessQuery =
  | { byUserId: string }
  | { byCustomerId: string }
  | { byKeywordId: string }
  | { byRecommendId: string }
  | { byAiOverviewId: string };

export function resolveCustomerAccessUseCase(
  customers: CustomerRepository,
  session: SessionGateway,
) {
  return async (
    query: CustomerAccessQuery,
  ): Promise<CustomerAccessContext> => {
    const user = await session.getCurrentUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const customer = await locate(customers, query);

    if (!customer) {
      throw new NotFoundError(notFoundMessageFor(query));
    }

    return new CustomerAccessContext(user, customer);
  };
}

async function locate(
  customers: CustomerRepository,
  query: CustomerAccessQuery,
) {
  if ("byUserId" in query) return customers.findByUserId(query.byUserId);
  if ("byCustomerId" in query) return customers.findById(query.byCustomerId);
  if ("byKeywordId" in query)
    return customers.findByKeywordId(query.byKeywordId);
  if ("byRecommendId" in query)
    return customers.findByRecommendId(query.byRecommendId);
  return customers.findByAiOverviewId(query.byAiOverviewId);
}

function notFoundMessageFor(query: CustomerAccessQuery): string {
  if ("byKeywordId" in query) return "Keyword not found";
  if ("byRecommendId" in query) return "Recommend keyword not found";
  if ("byAiOverviewId" in query) return "AI Overview not found";
  return "Customer not found";
}
