export type EntityStore<T> = {
  ids: string[];
  entities: Record<string, T>;
}

export const getList = <T>(entities: EntityStore<T>) => entities.ids.map((id) => entities.entities[id]);
export const getById = <T>(entities: EntityStore<T>, id: string) => entities.entities[id];

export const createEntityStore = <T>(entities: T[], getId:(t: T)=>string = (t:T) => (t as any).id ) => {
  const entityMap = entities.reduce<Record<string, T>>((acc, entity) => {
    acc[getId(entity)] = entity;
    return acc;
  }, {});

  return {
    ids: entities.map(getId),
    entities: entityMap,
  };
}
