export interface Ingredient {
  id: number;
  /** the name of the ingredient, e.g. "sugar" */
  name: string;
  /** the amount of the ingredient required */
  quantity_amount: number;
  /** e.g. 'g', 'ml', 'tbsp', 'cup' */
  quantity_type: string;
}

export interface Recipe {
  id: number;
  /** the name of the recipe */
  name: string;
  /** the description or  */
  description: string;
  /** (optional) the URL that this recipe originated from, if applicable */
  url: string;
  /** the list of ingredients required for this recipe */
  ingredients: Ingredient[];
  /** the list of steps required to prepare this recipe */
  preparation_steps: string[];
}

// define a type for a simple view of recipe, 
// excluding things like ingredients and preparation steps,
// e.g. for a list of recipes
export type RecipeOverview = Pick<Recipe, "id" | "name" | "description">;
