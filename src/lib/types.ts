export type UserRole = 'Administrator' | 'Gerente de Obra';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  password?: string;
}

export type ProjectStatus = 'planejamento' | 'em andamento' | 'pausada' | 'concluída';

export interface ProjectFile {
  name: string;
  url: string;
  path: string;
}
export interface Project {
  id: string;
  name: string;
  address: string;
  client: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  totalBudget: number;
  description: string;
  files: ProjectFile[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  salary: number;
  linkedProjectIds: string[];
  status: 'ativo' | 'inativo';
}

export type ExpenseCategory = 'material' | 'mao de obra' | 'equipamentos' | 'servicos' | 'documentacao' | 'outros';
export type ExpenseStatus = 'pago' | 'a pagar';

export interface Expense {
  id: string;
  date: string;
  paymentDate?: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  projectId: string;
  receipt: string;
  supplier: string;
  status: ExpenseStatus;
  // inventory-related fields
  materialName?: string;
  quantity?: number;
  unitPrice?: number;
  unit?: string;
}

export type TaskStatus = 'nao iniciada' | 'em andamento' | 'concluída';

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  responsible: string;
  priority: 'baixa' | 'media' | 'alta';
  projectId: string;
}

export interface InventoryItem {
    id: string;
    projectId: string;
    name: string;
    quantity: number;
    unit: string; // e.g., 'saco', 'm³', 'unidade'
    averagePrice: number;
}

export interface AppData {
  users: User[];
  projects: Project[];
  employees: Employee[];
  expenses: Expense[];
  tasks: Task[];
  inventory: InventoryItem[];
}
