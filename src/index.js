import Notiflix from "notiflix";
import SearchApiResults from "./js/api"; 
import { throttle } from "lodash";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const searchApiResults = new SearchApiResults();
let gallery = new SimpleLightbox('.gallery a');


const refs = {
    form: document.querySelector(".search-form"),
    gallery: document.querySelector('.gallery'),
    toTopBtn: document.querySelector('.to-top'),
}

refs.toTopBtn.addEventListener('click', onTopScroll);
refs.form.addEventListener("submit", onSubmit)

async function onSubmit(e) {
    e.preventDefault()
    const inputValue = refs.form.elements.searchQuery.value.trim();
     window.addEventListener("scroll", throttleScroll) 
    if (inputValue === "") {
        clearGallery()
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        return
    }
   
    clearGallery();

    searchApiResults.setSearchValue(inputValue);
    searchApiResults.resetPage();
   showResulst()
    
    
   
}
async function showResulst() {
    try {
        const markup = await generateHitsMarkup();
        if (markup === undefined) {
            throw new Error("No data!");
        }
       await appendResultsToList(markup) 
        gallery.refresh()
    } catch(err) {
        onError()
    }
   
}

async function generateHitsMarkup() {
    try {
        const { hits, totalHits } = await searchApiResults.getResults()
        const newPage = searchApiResults.page;
        const maxPage = Math.ceil(totalHits / 40)
        if (totalHits > 0) {
             Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`)
        }
        if (newPage > maxPage && totalHits > 0) {
        Notiflix.Notify.failure(`'We're sorry, but you've reached the end of search results'`);
            window.removeEventListener("scroll", throttleScroll);
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
    return `
    <div class="photo-card">
      <a href="${webformatURL}">
        <img
          class="results-img"
          src="${largeImageURL}" 
          alt="${tags}" 
          loading="lazy" 
          width="320"
          height="212"
        />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          <span>${likes}</span>
        </p>
        <p class="info-item">
          <b>Views</b>
          <span>${views}</span>
        </p>
        <p class="info-item">
          <b>Comments</b>
          <span>${comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads</b>
          <span>${downloads}</span>
        </p>
      </div>
    </div>
    `
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

const throttleScroll = throttle(handleScroll, 500)

 function handleScroll() {
    
      const offsetTrigger = 100;
  const pageOffset = window.pageYOffset;

  pageOffset > offsetTrigger
    ? refs.toTopBtn.classList.remove('is-hidden')
    : refs.toTopBtn.classList.add('is-hidden');

    const { clientHeight, scrollTop, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
        
     showResulst() 
    
    }
}

function onTopScroll() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}