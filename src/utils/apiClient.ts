import { get, post, put, del } from 'aws-amplify/api';

const API_NAME = 'itemsapi';
const ITEMS_PATH = '/items';

export interface ListingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  imageKeys: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemInput {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  imageKeys: string[];
}

export type UpdateItemInput = CreateItemInput;

export async function getItems(ownerId?: string): Promise<ListingItem[]> {
  const queryParams: Record<string, string> = {};
  if (ownerId) {
    queryParams.ownerId = ownerId;
  }
  const restOperation = get({
    apiName: API_NAME,
    path: ITEMS_PATH,
    options: { queryParams },
  });
  const { body } = await restOperation.response;
  const data = (await body.json()) as unknown;
  // Ensure we always return an array
  if (Array.isArray(data)) return data as ListingItem[];
  return [];
}

export async function getItem(id: string): Promise<ListingItem> {
  const restOperation = get({
    apiName: API_NAME,
    path: `${ITEMS_PATH}/${id}`,
  });
  const { body } = await restOperation.response;
  return (await body.json()) as unknown as ListingItem;
}

export async function createItem(input: CreateItemInput): Promise<ListingItem> {
  const restOperation = post({
    apiName: API_NAME,
    path: ITEMS_PATH,
    options: {
      body: JSON.parse(JSON.stringify(input)),
    },
  });
  const { body } = await restOperation.response;
  return (await body.json()) as unknown as ListingItem;
}

export async function updateItem(id: string, input: UpdateItemInput): Promise<ListingItem> {
  const restOperation = put({
    apiName: API_NAME,
    path: `${ITEMS_PATH}/${id}`,
    options: {
      body: JSON.parse(JSON.stringify(input)),
    },
  });
  const { body } = await restOperation.response;
  return (await body.json()) as unknown as ListingItem;
}

export async function deleteItem(id: string): Promise<void> {
  const restOperation = del({
    apiName: API_NAME,
    path: `${ITEMS_PATH}/${id}`,
  });
  await restOperation.response;
}
