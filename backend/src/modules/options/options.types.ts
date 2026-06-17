export type OptionGroupInput = {
  name: string;
  isRequired?: boolean;
  isMultiple?: boolean;
  sortOrder?: number;
};

export type UpdateOptionGroupInput = Partial<OptionGroupInput>;

export type OptionItemInput = {
  name: string;
  extraPrice?: number;
  imageUrl?: string | null;
  sortOrder?: number;
};

export type UpdateOptionItemInput = Partial<OptionItemInput>;
