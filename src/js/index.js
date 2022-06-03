import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/viewSearch";
import * as recipeView from "./views/viewRecipe";
import * as listView from "./views/viewList";
import * as likesView from "./views/viewLikes";
import { elements, renderLoader, clearLoader} from "./views/base";

/**Global state of the App
 * - Search Object
 * - Current Recipe Object
 * - Shopping List Object
 * - Liked Recipe
 */
         
const state = {};//It's empty obj, so each time when we relod the app then we'll have new state
window.state = state;

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async() => {
     //1) Get the query from view
      const query = searchView.getInput();
    
     if(query){
          //2) New Search object and add to the state
          state.search = new Search(query);

          //3) Prepare UI for results
          searchView.clearInput();
          searchView.clearResults();
          renderLoader(elements.searchRes); 

          try {
          //4) Search for Recipes
          await state.search.getResults();

          //5) Render the Results on UI
          clearLoader();
          searchView.renderResults(state.search.result);

          }catch (err){
               alert('Somthing went wrong with search...');
               clearLoader();
          }
     }
};

elements.searchForm.addEventListener('submit', e => {
     e.preventDefault();//the default action that belongs to the event will not occur.
     controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
     const btn = e.target.closest('.btn-inline');
     if(btn) {
          const goToPage = parseInt(btn.dataset.goto, 10);
          searchView.clearResults();
          searchView.renderResults(state.search.result, goToPage);
     };
});


/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
     //Get the Id grom URL
     const id = window.location.hash.replace('#', '');
     console.log(id);

     if(id){
          //Prepare UI for changes
          recipeView.clearRecipe();
          renderLoader(elements.recipe);

          //Highlight selected search item
          if(state.search) searchView.highlightSelected(id);

          //Create new recipe object
          state.recipe = new Recipe(id);

        try {
          //Get recipe data
          await state.recipe.getRecipe();
          state.recipe.parseIngredients();

          //Calculate servings and time
          state.recipe.calcTime();
          state.recipe.calcServings();

          //Render the recipe
          clearLoader();
          recipeView.renderRecipe(
               state.recipe,
               state.likes.isLiked(id)
          );

        }catch(err){
             alert('Error processing recipe!');
        }
         
     }
};

['hashchange', 'load'].forEach(event =>window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
 */
const controlList = () => {
    // Create the new list If there is none yet
    if (!state.list) state.list =  new List(); 

    //Add each ingredients to list and UI
    state.recipe.ingredients.forEach(el => {
         const item = state.list.addItem(el.count, el.unit, el.ingredient);
         listView.renderItem(item);
    });
    console.log(state.list);
};


//Handle delete and update list item event
elements.shopping.addEventListener('click', e => {
     const id = e.target.closest('.shopping__item').dataset.itemid;

     //Handle the delete button
     if(e.target.matches('.shopping__delete, .shopping__delete *')){
          //Delete from state
          state.list.deleteItem(id);

          //Dlete from UI
          listView.deleteItem(id);

     //Handle the count button
     }else if(e.target.matches('.shopping__count-value')){
          const val =  parseFloat(e.target.value, 10);
          state.list.updateCount(id, val);
     }
});

/**
 * Like CONTROLLER
 */
const controlLike = () => {
     // Create the new like If there is none yet
     if (!state.likes) state.likes =  new Likes(); 
     const currentID =  state.recipe.id;

     //User has NOT liked yet current recipe
     if(!state.likes.isLiked(currentID)){
          //Add the likes to the state
          const newLike = state.likes.addLikes(
               currentID,
               state.recipe.title,
               state.recipe.author,
               state.recipe.img
          );

          //Toggle the like button
          likesView.toggleLikeBtn(true);

          //Add the like to the UI
          likesView.renderLike(newLike);
          console.log(state.likes);
     
     //User HAS liked yet current recipe 
     }else{
          //Remove the likes from the state
          state.likes.deleteLike(currentID);

          //Toggle the like button
          likesView.toggleLikeBtn(false);

          //Remove the like from the UI
          likesView.deleteLike(currentID);
     };

     likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//Restore liked recipe on page load
window.addEventListener('load', () =>{
     state.likes =  new Likes(); 

     //Restore likes
     state.likes.readStorage();

     //Toggle likes menu button
     likesView.toggleLikeMenu(state.likes.getNumLikes());

     //Render the existing likes
     state.likes.likes.forEach(like => likesView.renderLike(like));
     
});

//Handling the recipe buttons click
elements.recipe.addEventListener("click", (e) => {
     if (e.target.matches(".btn-decrease, .btn-decrease *")) {
       // * i.e any child element of btn decrease
       //decrease btn is clickd
       if (state.recipe.servings > 1) {
         state.recipe.updateServings("dec");
         recipeView.updateServingsIng(state.recipe);
       }

     } else if (e.target.matches(".btn-increase, .btn-increase *")) {
       //increase btn is clickd
       state.recipe.updateServings("inc");
       recipeView.updateServingsIng(state.recipe);

     } else if (e.target.matches(".recipe__btn--add,.recipe__btn--add *")) {
       //Add ingredient to shopping list
       controlList();

     } else if (e.target.matches(".recipe__love,.recipe__love *")) {
       //LIKE CONTROLLER
       controlLike();
     }
     // console.log(state.recipe);
   
});

