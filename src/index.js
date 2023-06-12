import Notiflix from "notiflix";
import SearchApiResults from "./js/api"; 
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const searchApiResults = new SearchApiResults();
const refs = {
    form: document.querySelector(".search-form"),
    gallery: document.querySelector('.gallery')
}

refs.form.addEventListener("submit", onSubmit)

async function onSubmit(e) {
    e.preventDefault()
    const inputValue = refs.form.elements.searchQuery.value.trim();
    
    if (inputValue === "") {
        clearGallery()
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        return
    }
   
    clearGallery();

    searchApiResults.setSearchValue(inputValue);
    searchApiResults.resetPage();
    showResulst()
    window.addEventListener("scroll", handleScroll) 
    

}
async function showResulst() {

    try {
        const markup = await generateHitsMarkup();
       
        if (markup === undefined) {
            // Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            throw new Error("No data!");
        }
        appendResultsToList(markup) 
    } catch(err) {
        onError()
    }
   
}

async function generateHitsMarkup() {
    try {
        const { hits, totalHits } = await searchApiResults.getResults()
        const newPage = searchApiResults.page;
        const maxPage = Math.ceil(totalHits / 40)
        if (newPage === 2 && totalHits > 0) {
             Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`)
        }
        if (newPage >= maxPage && totalHits > 0) {
        Notiflix.Notify.failure(`'We're sorry, but you've reached the end of search results'`);
            window.removeEventListener('scroll', handleScroll);
        }


        if (hits.length === 0) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
              throw new Error("error");
        }

    return hits.reduce((markup, hit) => markup + createMarkup(hit), "")
    } catch(err) {
        onError()
  }
  
    
}

function createMarkup({ likes, views, comments, downloads, webformatURL, largeImageURL, tags }) {
    return `<a class="gallery__link" href="${largeImageURL}}"><div class="photo-card">
  <img class="results-img" src="${webformatURL}" alt="${tags}" loading="lazy"/>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
  </div>
</div></a>`

}

function appendResultsToList(markup) {
    refs.gallery.insertAdjacentHTML("beforeend", markup);
}

function clearGallery() {
    refs.gallery.innerHTML = "";
}

function onError(err) {
    
    clearGallery();
}

function handleScroll() {
    const { clientHeight, scrollTop, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
        showResulst()
    }
}