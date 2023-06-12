import axios from "axios";



const API_KEY = "37227007-40dc84962139d621dddfdc550"


export default class SearchApiResults {
    constructor() {
        this.page = 1;
        this.searchValue = "";
    }



    async getResults() {
        
        const url = `https://pixabay.com/api/?key=${API_KEY}&q=${this.searchValue}&image_type=photo&safesearch=true&orientation=horizontal&page=${this.page}&per_page=40`;

        const results = await axios.get(url);
        this.incrementPage()
        return results.data;
    }


    setSearchValue(query) {
        this.searchValue = query;
    }

    incrementPage() {
        this.page += 1;
    }

    resetPage() {
        this.page = 1;
    }
}