import axios from "axios";

export default class Recipe {
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            console.log(res);
        } catch(error){
            console.log('error');
            alert('Somthing went wrong :(');
        }
    }
    calcTime(){
        //Assuming that we need 15 min for each 3 ingredients.
        const numIng = this.ingredients.length; //numIng = 7
        const periods = Math.ceil(numIng / 3); // periods = 7/3 = Math.ceil(2.3) = 3
        this.time = periods * 15; // 3*15 = 45 min.
    };
    calcServings(){
        this.servings = 4;
    }

    parseIngredients(){
        const unitsLong =
        ["tablespoons","tablespoon","ounces","ounce","teaspoons","teaspoon","cups","pounds"];
         //teaspoons(teaspoon with 's' will be written first, u know why!!:)
        const unitsShort =
        ["tbsp","tbsp","oz","oz","tsp","tsp","cup","pound"];
        const units = [...unitsShort, 'kg', 'g']
         
        const newIngredient = this.ingredients.map(el => {
            //1) Uniform the Units
            let ingredient  = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            //2) Remove the parenthsis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            //3) Parse ingredients into count, units, and ingredients
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
            
            let objIng;
            if (unitIndex > -1){
                //1) There is Unit
                //Ex : 4 1/2 cups , arrCount = [4, 1/2];
                //Ex : 4 cups, arrCount = [4];
                const arrCount = arrIng.slice(0, unitIndex);
                
                let count;
                if(arrCount.length === 1){
                  count = eval(arrIng[0].replace("-", "+")); //exp 1-1/2--->eval("1+1/2")
                }else{
                    count = eval(arrIng.slice(0, unitIndex).join('+'));//4 1/2 --> eval("4+1/2") = 4.5 
                };

                objIng = {
                    count,
                    unit : arrIng[unitIndex],
                    ingredient : arrIng.slice(unitIndex + 1).join(' ')
                };
                 
            }else if (parseInt(arrIng[0])){
                //2) There is NO Unit but 1st position is number
                // arrIng =["1", "pizza", "dough"]
                objIng = {
                    count : parseInt(arrIng[0]), //parseInt("1") = 1
                    unit : '',
                    ingredient : arrIng.slice(1).join(' ') // ["pizza", "dough"].join(' ') = "pizza dough" 
                };

            }else if (unitIndex === -1){
                //3) There is No Unit and NO Number in first position
                objIng = {
                    count : 1,
                    unit : '',
                    ingredient
                };
            }
            return objIng;

        });
        this.ingredients = newIngredient;
    };

    updateServings (type) {
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings/this.servings);
        })

        this.servings =  newServings;
    }
};





