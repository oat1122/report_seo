export interface CustomerProfile {
  id: string;
  userId: string;
  name: string;
  domain: string;
  customerName: string | null;
}

export interface CustomerProfileRepository {
  findByUserId(userId: string): Promise<CustomerProfile | null>;
}
