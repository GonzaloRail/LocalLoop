export const MOCK_CAMPAIGNS = [
  {
    id: '1',
    name: 'Concierto Universitario',
    business: 'Eventos XYZ',
    category: 'Entretenimiento',
    description: 'Festival de bandas universitarias con 4 escenarios simultáneos.',
    startDate: '01/10/2026',
    endDate: '20/10/2026',
    budget: 200,
    reward: 2,
    maxConversions: 100,
    conversions: 70,
    usedBudget: 140,
    daysLeft: 18,
    status: 'active' as const,
    conversionAction: 'Compra de una entrada',
    validationMethod: 'Código + número de entrada',
    conditions: 'La compra debe realizarse durante la vigencia de la campaña y debe estar asociada al código del promotor.',
  },
  {
    id: '2',
    name: 'Gimnasio Fit Pass',
    business: 'Gym Fit',
    category: 'Salud',
    description: 'Membresía mensual con clases ilimitadas.',
    startDate: '05/10/2026',
    endDate: '05/11/2026',
    budget: 100,
    reward: 5,
    maxConversions: 20,
    conversions: 10,
    usedBudget: 50,
    daysLeft: 30,
    status: 'active' as const,
    conversionAction: 'Contratación de membresía',
    validationMethod: 'Código de referido',
    conditions: 'Solo aplica para nuevos clientes.',
  },
  {
    id: '3',
    name: 'Restaurante El Sabor',
    business: 'Restaurante El Sabor',
    category: 'Gastronomía',
    description: 'Menú ejecutivo con descuento especial para primeras visitas.',
    startDate: '01/09/2026',
    endDate: '30/09/2026',
    budget: 60,
    reward: 2,
    maxConversions: 30,
    conversions: 22,
    usedBudget: 44,
    daysLeft: 0,
    status: 'closing' as const,
    conversionAction: 'Consumo en restaurante',
    validationMethod: 'QR + ticket',
    conditions: 'Una recompensa por mesa.',
  },
]

export const MOCK_CONVERSIONS = [
  ...Array.from({ length: 35 }, (_, i) => ({
    id: `conv-diego-${i + 1}`,
    campaignId: '1',
    code: 'DIEGO82',
    promoter: 'Diego Huamani',
    operation: `Entrada #${58301 + i}`,
    date: `${10 + (i % 10)}/10/2026`,
    reward: 2,
    status: (i < 30 ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
  })),
  ...Array.from({ length: 22 }, (_, i) => ({
    id: `conv-ana-${i + 1}`,
    campaignId: '1',
    code: 'ANA99',
    promoter: 'Ana Morales',
    operation: `Entrada #${58336 + i}`,
    date: `${11 + (i % 9)}/10/2026`,
    reward: 2,
    status: (i < 18 ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
  })),
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `conv-carlos-${i + 1}`,
    campaignId: '1',
    code: 'CARLOS21',
    promoter: 'Carlos Vega',
    operation: `Entrada #${58358 + i}`,
    date: `${12 + (i % 8)}/10/2026`,
    reward: 2,
    status: (i < 10 ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
  })),
]

export const MOCK_PROMOTER_CAMPAIGNS = [
  { id: '1', campaignId: '1', campaignName: 'Concierto Universitario', code: 'DIEGO82', conversions: 35, earnings: 70, status: 'closing' as const },
  { id: '2', campaignId: '2', campaignName: 'Gimnasio Fit Pass', code: 'DIEGO45', conversions: 10, earnings: 20, status: 'active' as const },
  { id: '3', campaignId: '3', campaignName: 'Restaurante El Sabor', code: 'DIEGO91', conversions: 22, earnings: 44, status: 'active' as const },
]

export const MOCK_PROMOTER_CONVERSIONS = [
  { id: '1', operation: 'Entrada #58321', reward: 2, status: 'confirmed' as const, date: '12/10/2026' },
  { id: '2', operation: 'Entrada #58322', reward: 2, status: 'confirmed' as const, date: '13/10/2026' },
  { id: '3', operation: 'Entrada #58323', reward: 2, status: 'pending' as const, date: '14/10/2026' },
]

export const MOCK_TRANSACTIONS = [
  { id: 'tx1', campaign: 'Concierto Universitario', code: 'DIEGO82', amount: 70, date: '20/10/2026', txId: 'GABCDE...XK2', status: 'paid' as const },
  { id: 'tx2', campaign: 'Gimnasio Fit Pass', code: 'DIEGO45', amount: 20, date: '15/10/2026', txId: null, status: 'pending' as const },
]

export const PROMOTER_SUMMARY = {
  totalEarnings: 90,
  pending: 24,
  paid: 66,
  totalConversions: 67,
  activeCampaigns: 3,
}

export const BUSINESS_SUMMARY = {
  activeCampaigns: 2,
  closingCampaigns: 1,
  completedCampaigns: 0,
  totalConversions: 102,
  pendingRewards: 44,
  usedBudget: 234,
}

export const LIQUIDATION_PROMOTERS = [
  { name: 'Diego Huamani', conversions: 35, reward: 70 },
  { name: 'Ana Morales', conversions: 22, reward: 44 },
  { name: 'Carlos Vega', conversions: 13, reward: 26 },
]

