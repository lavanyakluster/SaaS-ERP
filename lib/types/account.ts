/**
 * Account Type Definitions
 */

export type AccountType = 'Asset' | 'Liability' | 'Income' | 'Expense' | 'Equity';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  parentCode?: string;
  level: number;
  isGroup: boolean;
  balance?: number;
  currency?: string;
  description?: string;
  isActive: boolean;
}

export interface AccountSearchResult {
  code: string;
  name: string;
  type: AccountType;
  balance?: number;
}

export interface ChartOfAccounts {
  accounts: Account[];
  hierarchy: AccountHierarchy[];
}

export interface AccountHierarchy {
  account: Account;
  children: AccountHierarchy[];
}
