// French month names
export const MONTHS_FR = [
  '',
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

// Month options for select inputs
export const MONTH_OPTIONS_FR = [
  { value: '1', label: 'Janvier' },
  { value: '2', label: 'Février' },
  { value: '3', label: 'Mars' },
  { value: '4', label: 'Avril' },
  { value: '5', label: 'Mai' },
  { value: '6', label: 'Juin' },
  { value: '7', label: 'Juillet' },
  { value: '8', label: 'Août' },
  { value: '9', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
];

// Habit frequencies
export const FREQUENCY_LABELS_FR: Record<string, string> = {
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  custom: 'Personnalisé',
};

// Budget scope labels
export const SCOPE_LABELS_FR: Record<string, string> = {
  personal: 'Personnel',
  common: 'Commun',
};

// Budget recurrence labels
export const RECURRENCE_LABELS_FR: Record<string, string> = {
  recurring: 'Récurrent',
  exceptional: 'Exceptionnel',
};

// Activity type labels (puppy)
export const ACTIVITY_TYPE_LABELS_FR: Record<string, string> = {
  walk: 'Promenade',
  meal: 'Repas',
  play: 'Jeu',
  training: 'Dressage',
  grooming: 'Toilettage',
  sleep: 'Sommeil',
  bathroom: 'Sortie',
  other: 'Autre',
};

// Training status labels
export const TRAINING_STATUS_LABELS_FR: Record<string, string> = {
  not_started: 'Non commencé',
  in_progress: 'En cours',
  learned: 'Acquis',
};

// Medication frequency labels
export const MEDICATION_FREQUENCY_LABELS_FR: Record<string, string> = {
  once_daily: 'Une fois par jour',
  twice_daily: 'Deux fois par jour',
  three_times_daily: 'Trois fois par jour',
  every_other_day: 'Un jour sur deux',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  as_needed: 'Selon besoin',
};

// Common labels
export const LABELS_FR = {
  // Actions
  create: 'Créer',
  add: 'Ajouter',
  edit: 'Modifier',
  delete: 'Supprimer',
  save: 'Enregistrer',
  cancel: 'Annuler',
  back: 'Retour',
  next: 'Suivant',
  view: 'Voir',
  log: 'Enregistrer',

  // Form labels
  name: 'Nom',
  email: 'Email',
  password: 'Mot de passe',
  amount: 'Montant',
  date: 'Date',
  category: 'Catégorie',
  description: 'Description',
  note: 'Note',
  notes: 'Notes',
  type: 'Type',
  frequency: 'Fréquence',

  // Status
  loading: 'Chargement...',
  active: 'Actif',
  completed: 'Terminé',
  pending: 'En attente',
  paid: 'Payé',

  // Counts
  member: 'membre',
  members: 'membres',
  pet: 'animal',
  pets: 'animaux',
};
