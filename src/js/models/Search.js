import axios from "axios";//Http request library ( for AJAX call )

export default class Search {
    constructor(query){
        this.query = query;//it's a prop of 'search' obj that we create based on this class.
    }
    async getResults() {
        try {
          const res = await axios(`https://forkify-api.herokuapp.com/api/search?q=${this.query}`);
          //console.log(res);
          this.result = res.data.recipes;
          //console.log(result);
        } catch (error) {
          alert(error);
        }
    }
};