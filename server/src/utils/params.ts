import { Request } from 'express';

/** Express 5 types params as string | string[] — normalize to string */
export function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}
