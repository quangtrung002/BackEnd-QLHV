export const PERM_KEYS = {
  ROLE: {
    VIEW: 'ROLE.VIEW',
    CREATE: 'ROLE.CREATE',
    UPDATE: 'ROLE.UPDATE',
    DELETE: 'ROLE.DELETE',
  },
  USER: {
    VIEW: 'USER.VIEW',
    CREATE: 'USER.CREATE',
    UPDATE: 'USER.UPDATE',
    DELETE: 'USER.DELETE',
  },
};
export const ALL_PERM_KEY = Object.values(PERM_KEYS).map(app => Object.values(app)).flat(2);