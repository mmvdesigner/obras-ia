import type { AppData } from './types';

// NOTE: The user IDs must now match the UIDs from Firebase Authentication
// After creating users in the Firebase Console, update these IDs accordingly.
export const initialData: AppData = {
  users: [
    // Example: Replace 'FIREBASE_UID_ADMIN' with the actual UID from Firebase Auth
    { id: '3iS9qW4aE7Y2Z0Z6j5x7rN8p2oB3', name: 'Admin User', email: 'admin@buildwise.com', role: 'Administrator', avatar: '/avatars/01.png' },
    // Example: Replace 'FIREBASE_UID_MANAGER' with the actual UID from Firebase Auth
    { id: 'kM5jH8fG6dC4b2a1L9pOnQwY7zI2', name: 'Manager User', email: 'manager@buildwise.com', role: 'Gerente de Obra', avatar: '/avatars/02.png' },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Residencial Vista Verde',
      address: 'Rua das Flores, 123, São Paulo, SP',
      client: 'Construtora Sol',
      startDate: '2024-05-01',
      endDate: '2025-05-01',
      status: 'em andamento',
      totalBudget: 500000,
      description: 'Construção de um edifício residencial de 10 andares.',
      files: ['planta_baixa.pdf', 'alvara.pdf'],
    },
    {
      id: 'proj-2',
      name: 'Centro Comercial Plaza',
      address: 'Avenida Principal, 456, Rio de Janeiro, RJ',
      client: 'Investimentos Urbanos',
      startDate: '2024-08-15',
      endDate: '2025-12-20',
      status: 'planejamento',
      totalBudget: 1200000,
      description: 'Novo centro comercial com 50 lojas e praça de alimentação.',
      files: [],
    },
    {
        id: 'proj-3',
        name: 'Reforma Escritório Central',
        address: 'Rua do Comércio, 789, Belo Horizonte, MG',
        client: 'Tech Solutions Inc.',
        startDate: '2024-03-10',
        endDate: '2024-07-30',
        status: 'concluída',
        totalBudget: 150000,
        description: 'Reforma completa do 5º andar do prédio comercial.',
        files: ['memorial_descritivo.docx'],
    }
  ],
  employees: [
    {
      id: 'emp-1',
      name: 'Carlos Silva',
      role: 'Engenheiro Civil',
      phone: '(11) 98765-4321',
      email: 'carlos.silva@buildwise.com',
      salary: 8500,
      linkedProjectIds: ['proj-1'],
      status: 'ativo',
    },
    {
      id: 'emp-2',
      name: 'Mariana Costa',
      role: 'Arquiteta',
      phone: '(21) 91234-5678',
      email: 'mariana.costa@buildwise.com',
      salary: 7800,
      linkedProjectIds: ['proj-1', 'proj-2'],
      status: 'ativo',
    },
    {
        id: 'emp-3',
        name: 'João Pereira',
        role: 'Mestre de Obras',
        phone: '(31) 99999-8888',
        email: 'joao.pereira@buildwise.com',
        salary: 4500,
        linkedProjectIds: ['proj-3'],
        status: 'inativo',
    }
  ],
  expenses: [
    {
      id: 'exp-1',
      date: '2024-06-10',
      description: 'Compra de cimento e areia',
      amount: 15000,
      category: 'material',
      projectId: 'proj-1',
      receipt: 'nota-fiscal-123.pdf',
      supplier: 'Casa do Construtor',
      status: 'pago',
      materialName: 'Cimento',
      quantity: 300,
      unitPrice: 50
    },
    {
      id: 'exp-2',
      date: '2024-06-12',
      description: 'Pagamento equipe de pedreiros',
      amount: 25000,
      category: 'mao de obra',
      projectId: 'proj-1',
      receipt: 'recibo-pagamento-jun.pdf',
      supplier: 'Empreiteira Mão na Massa',
      status: 'pago'
    },
    {
        id: 'exp-3',
        date: '2024-06-20',
        description: 'Aluguel de betoneira',
        amount: 2500,
        category: 'equipamentos',
        projectId: 'proj-1',
        receipt: 'recibo-locacao.pdf',
        supplier: 'AlugaTudo Máquinas',
        status: 'a pagar'
    }
  ],
  tasks: [
    {
      id: 'task-1',
      name: 'Fundação',
      startDate: '2024-05-10',
      endDate: '2024-06-20',
      status: 'em andamento',
      responsible: 'Carlos Silva',
      priority: 'alta',
      projectId: 'proj-1',
    },
    {
      id: 'task-2',
      name: 'Levantamento das paredes',
      startDate: '2024-06-21',
      endDate: '2024-08-30',
      status: 'nao iniciada',
      responsible: 'João Pereira',
      priority: 'alta',
      projectId: 'proj-1',
    },
    {
        id: 'task-3',
        name: 'Desenvolvimento do projeto arquitetônico',
        startDate: '2024-08-20',
        endDate: '2024-09-30',
        status: 'nao iniciada',
        responsible: 'Mariana Costa',
        priority: 'media',
        projectId: 'proj-2',
    }
  ],
  inventory: [
      {
          id: 'inv-1',
          projectId: 'proj-1',
          name: 'Cimento',
          quantity: 300,
          unit: 'saco',
          averagePrice: 50
      },
      {
          id: 'inv-2',
          projectId: 'proj-1',
          name: 'Areia',
          quantity: 20,
          unit: 'm³',
          averagePrice: 100
      }
  ]
};
