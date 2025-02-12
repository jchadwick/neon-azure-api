import { Hono } from "hono";
import db from "./lib/db";
import { Ingredient, type Recipe, type RecipeOverview } from "./models";

const app = new Hono();

app.get("/api", (c) => c.text("Recipes API"));

// retrieve all stored recipes
app.get("/api/recipes", async (c) => {
  const { rows: recipes } = await db.query<RecipeOverview>(
    "SELECT id, name, description FROM recipes"
  );
  return c.json(recipes);
});

app.get("/api/recipes/:id", async (c) => {
  const recipeId = +c.req.param("id");

  const [recipeResults, ingredientsResults] = await Promise.all([
    db.query<Recipe>(
      `SELECT id, name, description, preparation_steps, url
         FROM recipes 
         WHERE id = $1
         LIMIT 1
        `,
      [recipeId]
    ),
    db.query<Ingredient>(
      `SELECT id, name, quantity_amount, quantity_type
         FROM ingredients
         WHERE recipe_id = $1
        `,
      [recipeId]
    ),
  ]);

  if (recipeResults.rowCount === 0) {
    return c.json(null, 404);
  }

  const recipe = {
    ...recipeResults.rows[0],
    ingredients: ingredientsResults.rows,
  };

  return c.json(recipe);
});

app.post("/api/recipes", async (c) => {
  const { name, description, url, preparation_steps, ingredients } =
    await c.req.json<Recipe>();

  // create the recipe, retrieving the added recipe
  // so we can use its id to add ingredients below
  const {
    rows: [addedRecipe],
  } = await db.query<Recipe>(
    `INSERT INTO recipes (name, description, url, preparation_steps)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, url, preparation_steps
      `,
    [name, description, url, preparation_steps]
  );

  // bulk insert ingredients for the recipe
  const { rows: addedIngredients } = await db.query(
    `
    INSERT INTO ingredients (name, quantity_amount, quantity_type, recipe_id)
    VALUES ${ingredients
      .map(
        // produces a string like ($1, $2, $3, $4) to create placeholders
        // for each one of the ingredients, concatenating them all together
        // with commas to produce a single string like:
        // ($1, $2, $3, $4),($5, $6, $7, $8),($9, $10, $11, $12)
        (_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
      )
      .join(",")}
    RETURNING id, name, quantity_amount, quantity_type
    `,
    ingredients.flatMap((ingredient) => [
      ingredient.name,
      ingredient.quantity_amount,
      ingredient.quantity_type,
      addedRecipe.id,
    ])
  );

  addedRecipe.ingredients = addedIngredients;

  return c.json(addedRecipe, 201);
});

export default app;
